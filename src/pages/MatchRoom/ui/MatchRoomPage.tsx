import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Anchor, Box, Button, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { fetchHeroes, type HeroClass } from '@/entities/hero';
import {
	cancelMatch,
	createMatch,
	draftPick,
	draftPreset,
	draftRandom,
	fetchMatchById,
	formatRulesSummary,
	type Match,
	type MatchDraftPick,
	moveDraftPick,
} from '@/entities/match';
import { fetchCurrentPlayer, type Player } from '@/entities/player';
import { BattlePanel } from '@/features/battle';
import { DraftHeroCard, DraftRowDropZone, HeroDetailModal } from '@/features/draft';
import { ApiError } from '@/shared/api/http';
import { API_BASE_URL } from '@/shared/constants';
import { InviteCodeChip } from '@/shared/ui/InviteCodeChip';
import { PageFrame } from '@/shared/ui/PageFrame';
import { PlayerIdentity } from '@/shared/ui/PlayerAvatar';

import { DraftPresetModal } from './DraftPresetModal';
import draftStyles from './MatchRoomDraft.module.css';

const POLL_MS = 2500;
const PING_MS = 20_000;

const battleWsUrl = (matchId: string): string => {
	const wsBase = API_BASE_URL.replace(/^http/i, 'ws');
	return `${wsBase}/matches/ws/${encodeURIComponent(matchId)}`;
};

const RESULT_META_RETRY_MS = [80, 160, 320, 640] as const;

type BattleEndedRating = {
	playerId: string;
	ptsBefore: number;
	ptsAfter: number;
	ptsDelta: number;
};

type BattleWsPayload = {
	type?: string;
	message?: string;
	battle?: Match['battle'];
	resultMeta?: {
		durationSeconds: number | null;
		ratings: BattleEndedRating[];
	};
};

const mergeBattleFrame = (
	prev: Match,
	payload: BattleWsPayload,
	viewerId: string | null,
): Match => {
	const battle = payload.battle;
	if (!battle) {
		return prev;
	}
	const nextStatus =
		payload.type === 'battle:ended' || battle.outcome !== 'ongoing'
			? 'finished'
			: prev.status === 'fighting'
				? 'fighting'
				: prev.status;
	const justFinished = nextStatus === 'finished' && prev.status !== 'finished';
	const meta = payload.resultMeta;
	const ownRating =
		meta && viewerId ? (meta.ratings.find((row) => row.playerId === viewerId) ?? null) : undefined;
	const fromMeta =
		justFinished && meta
			? {
					durationSeconds: meta.durationSeconds,
					myRating: ownRating
						? {
								ptsBefore: ownRating.ptsBefore,
								ptsAfter: ownRating.ptsAfter,
								ptsDelta: ownRating.ptsDelta,
							}
						: null,
					finishedAt: new Date().toISOString(),
				}
			: justFinished
				? { myRating: undefined, durationSeconds: null, finishedAt: null }
				: {};
	return {
		...prev,
		status: nextStatus,
		winnerPlayerId: battle.winnerPlayerId ?? prev.winnerPlayerId,
		...fromMeta,
		battle: {
			...battle,
			skillLabel: battle.skillLabel ?? null,
			legalSkillTargetIds: battle.legalSkillTargetIds ?? [],
			abilities: battle.abilities ?? [],
			pendingPrompt: battle.pendingPrompt ?? null,
			units: (battle.units ?? []).map((unit) => ({
				...unit,
				effects: unit.effects ?? [],
				isSummon: unit.isSummon ?? false,
				horseIsDead: unit.horseIsDead ?? false,
				mana: unit.mana ?? 0,
			})),
		},
	};
};

const sleep = (ms: number): Promise<void> =>
	new Promise((resolve) => {
		window.setTimeout(resolve, ms);
	});
const ROW_FRONT = 0;
const ROW_BACK = 1;

export const MatchRoomPage = () => {
	const { matchId } = useParams({ from: '/lobby/$matchId' });
	const navigate = useNavigate();
	const [player, setPlayer] = useState<Player | null>(null);
	const [match, setMatch] = useState<Match | null>(null);
	const [heroes, setHeroes] = useState<HeroClass[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isBusy, setIsBusy] = useState(false);
	const [bootError, setBootError] = useState<string | null>(null);
	const [modalHeroCode, setModalHeroCode] = useState<string | null>(null);
	const [presetModalOpen, setPresetModalOpen] = useState(false);
	/** Ждём GET с ПТС/длительностью после battle:ended. */
	const [resultMetaLoading, setResultMetaLoading] = useState(false);
	/** Экран «Отряды собраны» перед боем. */
	const [squadsReadyVisible, setSquadsReadyVisible] = useState(false);
	const [focusedHeroCode, setFocusedHeroCode] = useState<string | null>(null);
	const battleSocketRef = useRef<WebSocket | null>(null);
	const playerIdRef = useRef<string | null>(null);
	const prevMatchStatusRef = useRef<Match['status'] | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
	);

	playerIdRef.current = player?.id ?? null;

	useEffect(() => {
		let isMounted = true;
		setResultMetaLoading(false);
		setSquadsReadyVisible(false);
		prevMatchStatusRef.current = null;
		const boot = async () => {
			try {
				const [current, loaded, heroList] = await Promise.all([
					fetchCurrentPlayer(),
					fetchMatchById(matchId),
					fetchHeroes(),
				]);
				if (!isMounted) {
					return;
				}
				setPlayer(current);
				setMatch(loaded);
				setHeroes(heroList);
			} catch (err) {
				if (isMounted) {
					setBootError(err instanceof ApiError ? err.message : 'Не удалось загрузить матч');
				}
			}
		};
		void boot();
		return () => {
			isMounted = false;
		};
	}, [matchId]);

	const activeMatchId = match?.id;
	const activeMatchStatus = match?.status;

	useEffect(() => {
		if (
			!activeMatchId ||
			activeMatchStatus === 'cancelled' ||
			activeMatchStatus === 'finished' ||
			activeMatchStatus === 'fighting'
		) {
			return;
		}
		const timer = window.setInterval(() => {
			void fetchMatchById(activeMatchId)
				.then((next) => {
					setMatch(next);
				})
				.catch(() => {
					/* ignore transient poll errors */
				});
		}, POLL_MS);
		return () => {
			window.clearInterval(timer);
		};
	}, [activeMatchId, activeMatchStatus]);

	/**
	 * После окончания боя WS-эффект размонтируется (status ≠ fighting) и отменяет
	 * inline-refetch. Отдельно тянем мету (ПТС / длительность) с повторами.
	 */
	useEffect(() => {
		if (!activeMatchId || !resultMetaLoading) {
			return;
		}
		let cancelled = false;
		const loadResultMeta = async () => {
			for (let attempt = 0; attempt < RESULT_META_RETRY_MS.length; attempt += 1) {
				if (attempt > 0) {
					await sleep(RESULT_META_RETRY_MS[attempt - 1] ?? 300);
				}
				if (cancelled) {
					return;
				}
				try {
					const next = await fetchMatchById(activeMatchId);
					if (cancelled) {
						return;
					}
					if (next.durationSeconds != null || attempt === RESULT_META_RETRY_MS.length - 1) {
						setMatch(next);
						setResultMetaLoading(false);
						return;
					}
				} catch {
					if (attempt === RESULT_META_RETRY_MS.length - 1 && !cancelled) {
						setResultMetaLoading(false);
					}
				}
			}
		};
		void loadResultMeta();
		return () => {
			cancelled = true;
		};
	}, [activeMatchId, resultMetaLoading]);

	/** Короткий экран «Отряды собраны» при переходе drafting → fighting. */
	useEffect(() => {
		const prev = prevMatchStatusRef.current;
		const next = match?.status ?? null;
		if (prev === 'drafting' && next === 'fighting') {
			setSquadsReadyVisible(true);
			const timer = window.setTimeout(() => {
				setSquadsReadyVisible(false);
			}, 1600);
			prevMatchStatusRef.current = next;
			return () => {
				window.clearTimeout(timer);
			};
		}
		if (next) {
			prevMatchStatusRef.current = next;
		}
		return undefined;
	}, [match?.status]);

	useEffect(() => {
		if (!activeMatchId || activeMatchStatus !== 'fighting') {
			return;
		}
		let closed = false;
		let socket: WebSocket | null = null;
		let attempt = 0;
		let generation = 0;
		let pingTimer = 0;
		let reconnectTimer = 0;

		const connect = () => {
			const mine = ++generation;
			socket = new WebSocket(battleWsUrl(activeMatchId));
			battleSocketRef.current = socket;
			socket.addEventListener('open', () => {
				if (closed || mine !== generation) {
					return;
				}
				attempt = 0;
				socket?.send(JSON.stringify({ type: 'join' }));
				window.clearInterval(pingTimer);
				pingTimer = window.setInterval(() => {
					if (socket?.readyState === WebSocket.OPEN) {
						socket.send(JSON.stringify({ type: 'ping' }));
					}
				}, PING_MS);
			});
			socket.addEventListener('message', (event) => {
				if (closed || mine !== generation) {
					return;
				}
				try {
					const payload = JSON.parse(String(event.data)) as BattleWsPayload;
					if (payload.type === 'error') {
						setError(payload.message ?? 'Ошибка боя');
						setIsBusy(false);
						return;
					}
					if (payload.type === 'pong' || payload.type === 'join') {
						return;
					}
					if (
						(payload.type === 'battle:state' || payload.type === 'battle:ended') &&
						payload.battle
					) {
						const ended = payload.type === 'battle:ended' || payload.battle.outcome !== 'ongoing';
						const hasMeta =
							ended && payload.resultMeta != null && payload.resultMeta.durationSeconds != null;
						setMatch((prev) =>
							prev ? mergeBattleFrame(prev, payload, playerIdRef.current) : prev,
						);
						setIsBusy(false);
						if (ended) {
							setResultMetaLoading(!hasMeta);
						}
					}
				} catch {
					/* ignore malformed frames */
				}
			});
			socket.addEventListener('close', () => {
				window.clearInterval(pingTimer);
				if (battleSocketRef.current === socket) {
					battleSocketRef.current = null;
				}
				if (closed || mine !== generation) {
					return;
				}
				void fetchMatchById(activeMatchId)
					.then((next) => {
						if (!closed) {
							setMatch(next);
						}
					})
					.catch(() => {
						/* ignore */
					});
				const delay = Math.min(8000, 1000 * 2 ** attempt);
				attempt += 1;
				reconnectTimer = window.setTimeout(connect, delay);
			});
		};

		connect();
		return () => {
			closed = true;
			window.clearInterval(pingTimer);
			window.clearTimeout(reconnectTimer);
			battleSocketRef.current = null;
			socket?.close();
		};
	}, [activeMatchId, activeMatchStatus]);

	const handleCancel = async () => {
		if (!match) {
			return;
		}
		setIsBusy(true);
		setError(null);
		try {
			const cancelled = await cancelMatch(match.id);
			setMatch(cancelled);
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Ошибка отмены');
		} finally {
			setIsBusy(false);
		}
	};

	const handleRandom = async () => {
		if (!match) {
			return;
		}
		setIsBusy(true);
		setError(null);
		try {
			const next = await draftRandom({ matchId: match.id });
			setMatch(next);
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Ошибка случайного выбора');
		} finally {
			setIsBusy(false);
		}
	};

	const handleApplyPreset = async (presetId: string) => {
		if (!match) {
			return;
		}
		setIsBusy(true);
		setError(null);
		try {
			const next = await draftPreset({ matchId: match.id, presetId });
			setMatch(next);
			setPresetModalOpen(false);
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Ошибка пресета');
		} finally {
			setIsBusy(false);
		}
	};

	const sendBattleFrame = (frame: Record<string, unknown>) => {
		const socket = battleSocketRef.current;
		if (!socket || socket.readyState !== WebSocket.OPEN) {
			setError('Нет связи с боем');
			setIsBusy(false);
			return;
		}
		socket.send(JSON.stringify(frame));
	};

	const handleBattleAction = (input: {
		unitId: string;
		action: 'attack' | 'defend' | 'wait' | 'skill' | 'ability' | 'move';
		targetId?: string;
		slot?: 1 | 2 | 3 | 4 | 5;
		choice?: string;
	}) => {
		if (!match) {
			return;
		}
		setIsBusy(true);
		setError(null);
		sendBattleFrame({ type: 'action', ...input });
	};

	const handleSurrender = () => {
		if (!match) {
			return;
		}
		setIsBusy(true);
		setError(null);
		sendBattleFrame({ type: 'surrender' });
	};

	const handleOfferDraw = () => {
		if (!match) {
			return;
		}
		setIsBusy(true);
		setError(null);
		sendBattleFrame({ type: 'draw-offer' });
	};

	const handleAcceptDraw = () => {
		if (!match) {
			return;
		}
		setIsBusy(true);
		setError(null);
		sendBattleFrame({ type: 'draw-accept' });
	};

	const handleDeclineDraw = () => {
		if (!match) {
			return;
		}
		setIsBusy(true);
		setError(null);
		sendBattleFrame({ type: 'draw-decline' });
	};

	const handleRematch = async () => {
		if (!match) {
			return;
		}
		setIsBusy(true);
		setError(null);
		try {
			const created = await createMatch(match.rules);
			await navigate({ to: '/lobby/$matchId', params: { matchId: created.id } });
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Не удалось создать реванш');
			setIsBusy(false);
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		if (!match || !player || isBusy) {
			return;
		}
		const over = event.over;
		if (!over) {
			return;
		}
		const overData = over.data.current as
			| { type?: string; row?: number; ownerPlayerId?: string }
			| undefined;
		if (overData?.type !== 'row' || overData.ownerPlayerId !== player.id) {
			return;
		}
		const row = overData.row;
		if (row !== ROW_FRONT && row !== ROW_BACK) {
			return;
		}

		const activeData = event.active.data.current as
			| { type?: string; heroCode?: string; pickId?: string; fromRow?: number; size?: number }
			| undefined;

		if (activeData?.type === 'hero' && activeData.heroCode) {
			if (match.draft.turnPlayerId !== player.id) {
				return;
			}
			const hero = heroes.find((item) => item.code === activeData.heroCode);
			const mySize = player.id === match.host.id ? match.draft.hostSize : match.draft.guestSize;
			if (!hero || mySize + hero.size > match.draft.initialTeamSize) {
				return;
			}
			const ownHas = [...match.draft.hostPicks, ...match.draft.guestPicks].some(
				(pick) => pick.playerId === player.id && pick.heroClassCode === hero.code,
			);
			const matchHas = [...match.draft.hostPicks, ...match.draft.guestPicks].some(
				(pick) => pick.heroClassCode === hero.code,
			);
			if (
				(match.rules.heroDupes === 'uniqueTeam' && ownHas) ||
				(match.rules.heroDupes === 'uniqueMatch' && matchHas)
			) {
				return;
			}
			setIsBusy(true);
			setError(null);
			void draftPick({ matchId: match.id, heroCode: activeData.heroCode, row })
				.then((next) => setMatch(next))
				.catch((err: unknown) => {
					setError(err instanceof ApiError ? err.message : 'Ошибка выбора');
				})
				.finally(() => setIsBusy(false));
			return;
		}

		if (activeData?.type === 'pick' && activeData.pickId) {
			if (activeData.fromRow === row) {
				return;
			}
			setIsBusy(true);
			setError(null);
			void moveDraftPick({ matchId: match.id, pickId: activeData.pickId, row })
				.then((next) => setMatch(next))
				.catch((err: unknown) => {
					setError(err instanceof ApiError ? err.message : 'Ошибка перестановки');
				})
				.finally(() => setIsBusy(false));
		}
	};

	const isHost = Boolean(player && match && player.id === match.host.id);
	const isMyTurn = Boolean(
		player && match?.status === 'drafting' && match.draft.turnPlayerId === player.id,
	);
	const mySize =
		player && match
			? player.id === match.host.id
				? match.draft.hostSize
				: match.draft.guestSize
			: 0;
	const myEntry =
		player && match
			? player.id === match.host.id
				? (match.draft.hostEntry ?? (mySize > 0 ? 'draft' : 'empty'))
				: (match.draft.guestEntry ?? (mySize > 0 ? 'draft' : 'empty'))
			: 'empty';
	const lockedByPreset = myEntry === 'preset';
	const canApplyPreset =
		match?.status === 'drafting' &&
		match.draft.initialTeamSize >= 3 &&
		myEntry === 'empty' &&
		!isBusy;

	if (bootError) {
		return (
			<PageFrame width="wide">
				<Stack gap="md" maw={480}>
					<Title order={1}>Матч</Title>
					<Text c="red" role="alert">
						{bootError}
					</Text>
					<Anchor component={Link} to="/lobby" c="brand" fw={600}>
						← К лобби
					</Anchor>
				</Stack>
			</PageFrame>
		);
	}

	if (!match || !player) {
		return (
			<PageFrame width="wide">
				<Text c="var(--app-text-muted)">Загрузка матча…</Text>
			</PageFrame>
		);
	}

	const canDragUnits =
		match.status === 'drafting' &&
		!isBusy &&
		!lockedByPreset &&
		(player.id === match.host.id || player.id === match.guest?.id);

	const handlePickRow = (heroCode: string, row: number) => {
		if (isBusy || lockedByPreset || match.draft.turnPlayerId !== player.id) {
			return;
		}
		const hero = heroes.find((item) => item.code === heroCode);
		if (!hero || mySize + hero.size > match.draft.initialTeamSize) {
			return;
		}
		setIsBusy(true);
		setError(null);
		void draftPick({ matchId: match.id, heroCode, row })
			.then((next) => setMatch(next))
			.catch((err: unknown) => {
				setError(err instanceof ApiError ? err.message : 'Ошибка выбора');
			})
			.finally(() => setIsBusy(false));
	};

	const selfIsHost = player.id === match.host.id;
	const focusedHero = focusedHeroCode ? heroes.find((hero) => hero.code === focusedHeroCode) : null;
	const projectedSize =
		focusedHero && isMyTurn && !lockedByPreset ? mySize + focusedHero.size : null;
	const quotaLabel =
		projectedSize !== null && projectedSize <= match.draft.initialTeamSize
			? `${mySize}/${match.draft.initialTeamSize} → ${projectedSize}/${match.draft.initialTeamSize}`
			: `${mySize}/${match.draft.initialTeamSize}`;

	const hostPanel = (
		<TeamPanel
			title={
				<PlayerIdentity
					name={match.host.displayName}
					avatarUrl={match.host.avatarUrl}
					prefix="Игрок 1"
					size={28}
				/>
			}
			ownerPlayerId={match.host.id}
			size={match.draft.hostSize}
			cap={match.draft.initialTeamSize}
			projectedSize={selfIsHost ? projectedSize : null}
			picks={match.draft.hostPicks}
			isTurn={match.draft.turnPlayerId === match.host.id}
			acceptDrops={player.id === match.host.id && !isBusy && !lockedByPreset}
			canDragUnits={canDragUnits && player.id === match.host.id}
			mirrorRows={selfIsHost}
		/>
	);
	const guestPanel = (
		<TeamPanel
			title={
				<PlayerIdentity
					name={match.guest?.displayName ?? '…'}
					avatarUrl={match.guest?.avatarUrl}
					prefix="Игрок 2"
					size={28}
				/>
			}
			ownerPlayerId={match.guest?.id ?? 'guest'}
			size={match.draft.guestSize}
			cap={match.draft.initialTeamSize}
			projectedSize={!selfIsHost ? projectedSize : null}
			picks={match.draft.guestPicks}
			isTurn={match.draft.turnPlayerId === match.guest?.id}
			acceptDrops={
				Boolean(match.guest) && player.id === match.guest?.id && !isBusy && !lockedByPreset
			}
			canDragUnits={canDragUnits && Boolean(match.guest) && player.id === match.guest?.id}
			mirrorRows={!selfIsHost}
		/>
	);

	return (
		<PageFrame width="wide">
			{squadsReadyVisible ? (
				<output className={draftStyles.squadsReady} aria-live="polite">
					<div className={draftStyles.squadsReadyCard}>
						<h2 className={draftStyles.squadsReadyTitle}>Отряды собраны</h2>
						<div className={draftStyles.squadsReadyTeams}>
							<SquadPreview
								title={match.host.displayName}
								picks={match.draft.hostPicks}
								fallbackUnits={match.battle?.units.filter((unit) => unit.team === 0)}
							/>
							<SquadPreview
								title={match.guest?.displayName ?? 'Соперник'}
								picks={match.draft.guestPicks}
								fallbackUnits={match.battle?.units.filter((unit) => unit.team === 1)}
							/>
						</div>
					</div>
				</output>
			) : null}
			<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
				<Stack gap="lg" w="100%">
					<Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
						<Stack gap={6} maw={560}>
							<Anchor component={Link} to="/lobby" c="brand" fw={600} size="sm">
								← Лобби
							</Anchor>
							<Title order={1}>Матч</Title>
							<Text c="var(--app-text-muted)">
								Статус: {statusLabel(match.status)}. Код:{' '}
								<InviteCodeChip code={match.inviteCode} compact />
							</Text>
							{match.rules && (
								<Text size="sm" c="var(--app-text-muted)" ff="monospace">
									{formatRulesSummary(match.rules)}
								</Text>
							)}
						</Stack>
						{isHost && (match.status === 'waiting' || match.status === 'drafting') && (
							<Button
								variant="outline"
								color="red"
								loading={isBusy}
								onClick={() => void handleCancel()}
							>
								Отменить
							</Button>
						)}
					</Group>

					{match.status === 'waiting' && (
						<Box className="sylvenarr-panel" maw={520}>
							<Stack gap="sm">
								<Text fw={600}>Ожидание соперника</Text>
								<Text size="sm" c="var(--app-text-muted)">
									Передайте код другу. После входа начнётся набор отряда — ходит игрок 1.
								</Text>
								<InviteCodeChip code={match.inviteCode} />
								<PlayerIdentity
									name={match.host.displayName}
									avatarUrl={match.host.avatarUrl}
									prefix="Игрок 1"
									size={28}
									muted
								/>
							</Stack>
						</Box>
					)}

					{(match.status === 'fighting' || match.status === 'finished') && (
						<Box className="sylvenarr-panel">
							<Stack gap="md">
								{error && (
									<Text c="red" role="alert">
										{error}
									</Text>
								)}
								<BattlePanel
									match={match}
									playerId={player.id}
									busy={isBusy}
									resultMetaLoading={resultMetaLoading}
									onAction={(input) => void handleBattleAction(input)}
									onSurrender={() => void handleSurrender()}
									onOfferDraw={() => void handleOfferDraw()}
									onAcceptDraw={() => void handleAcceptDraw()}
									onDeclineDraw={() => void handleDeclineDraw()}
									onRematch={() => void handleRematch()}
									onLobby={() => void navigate({ to: '/lobby' })}
									onMatches={() => void navigate({ to: '/matches' })}
								/>
							</Stack>
						</Box>
					)}

					{match.status === 'drafting' && (
						<div className={draftStyles.draftLayout}>
							<div className={draftStyles.teamsColumn}>
								{selfIsHost ? (
									<>
										{hostPanel}
										{guestPanel}
									</>
								) : (
									<>
										{guestPanel}
										{hostPanel}
									</>
								)}
								<Text size="sm" c="var(--app-text-muted)">
									Передний ряд принимает удар первым; задний ряд защищён, пока в переднем есть живые
									герои.
								</Text>
							</div>

							<div className={draftStyles.catalogPanel}>
								<Group justify="space-between" align="center" wrap="wrap" gap="sm">
									<Text fw={600}>
										{lockedByPreset
											? 'Отряд зафиксирован пресетом. Ждём соперника…'
											: isMyTurn
												? `Ваш ход · квота ${quotaLabel}. Выберите героя кнопкой ряда или Enter.`
												: 'Ход соперника…'}
									</Text>
									<Group gap="sm">
										{canApplyPreset ? (
											<Button
												variant="light"
												color="brand"
												disabled={isBusy}
												onClick={() => setPresetModalOpen(true)}
											>
												Пресет
											</Button>
										) : null}
										<Button
											variant="light"
											color="accent"
											loading={isBusy}
											disabled={!isMyTurn || lockedByPreset}
											onClick={() => void handleRandom()}
										>
											Случайный герой (+1)
										</Button>
									</Group>
								</Group>
								{error && (
									<Text c="red" role="alert">
										{error}
									</Text>
								)}
								{!lockedByPreset ? (
									<>
										<Text size="sm" c="var(--app-text-muted)">
											Цифра в углу — слоты в отряде (I / II). Перетаскивание на ряд тоже работает.
										</Text>
										<div className={draftStyles.catalogScroll}>
											<SimpleGrid
												cols={{ base: 2, sm: 3, md: 4, lg: 5 }}
												spacing="md"
												verticalSpacing="md"
											>
												{[...heroes]
													.sort(
														(a, b) =>
															b.size - a.size || a.displayName.localeCompare(b.displayName, 'ru'),
													)
													.map((hero) => {
														const freeSlots = match.draft.initialTeamSize - mySize;
														const fits = hero.size <= freeSlots;
														const ownCodes = new Set(
															[...match.draft.hostPicks, ...match.draft.guestPicks]
																.filter((pick) => pick.playerId === player.id)
																.map((pick) => pick.heroClassCode),
														);
														const allCodes = new Set(
															[...match.draft.hostPicks, ...match.draft.guestPicks].map(
																(pick) => pick.heroClassCode,
															),
														);
														const selected = ownCodes.has(hero.code);
														const blockedByDupes =
															(match.rules.heroDupes === 'uniqueTeam' && selected) ||
															(match.rules.heroDupes === 'uniqueMatch' && allCodes.has(hero.code));
														const disabled = !isMyTurn || isBusy || !fits || blockedByDupes;
														const disabledReason = !isMyTurn
															? 'Сейчас ход соперника'
															: blockedByDupes
																? match.rules.heroDupes === 'uniqueMatch'
																	? 'Этот класс уже выбран в матче'
																	: 'Этот класс уже есть в вашем отряде'
																: !fits
																	? `Не хватает места: нужно ${hero.size}, свободно ${freeSlots}`
																	: undefined;
														return (
															<DraftHeroCard
																key={hero.code}
																hero={hero}
																disabled={disabled}
																disabledReason={disabledReason}
																selected={selected}
																focused={focusedHeroCode === hero.code}
																onFocusHero={setFocusedHeroCode}
																onOpen={setModalHeroCode}
																onPickRow={handlePickRow}
															/>
														);
													})}
											</SimpleGrid>
										</div>
									</>
								) : null}
							</div>
						</div>
					)}

					{match.status === 'cancelled' && (
						<Box className="sylvenarr-panel" maw={480}>
							<Text>Матч отменён.</Text>
							<Button mt="md" component={Link} to="/lobby" color="brand">
								К лобби
							</Button>
						</Box>
					)}
				</Stack>
			</DndContext>

			<HeroDetailModal code={modalHeroCode} onClose={() => setModalHeroCode(null)} />
			<DraftPresetModal
				opened={presetModalOpen}
				teamSize={match.draft.initialTeamSize}
				busy={isBusy}
				onClose={() => setPresetModalOpen(false)}
				onPick={(presetId) => void handleApplyPreset(presetId)}
			/>
		</PageFrame>
	);
};

const TeamPanel = ({
	title,
	ownerPlayerId,
	size,
	cap,
	projectedSize,
	picks,
	isTurn,
	acceptDrops,
	canDragUnits,
	mirrorRows = false,
}: {
	title: ReactNode;
	ownerPlayerId: string;
	size: number;
	cap: number;
	projectedSize?: number | null;
	picks: MatchDraftPick[];
	isTurn: boolean;
	acceptDrops: boolean;
	canDragUnits: boolean;
	/** Свой отряд: задний у внешнего края, передний к центру. */
	mirrorRows?: boolean;
}) => {
	const front = picks.filter((pick) => pick.row === ROW_FRONT);
	const back = picks.filter((pick) => pick.row === ROW_BACK);
	const frontZone = (
		<DraftRowDropZone
			row={ROW_FRONT}
			label="Передний ряд"
			picks={front}
			acceptDrops={acceptDrops}
			ownerPlayerId={ownerPlayerId}
			canDragUnits={canDragUnits}
		/>
	);
	const backZone = (
		<DraftRowDropZone
			row={ROW_BACK}
			label="Задний ряд"
			picks={back}
			acceptDrops={acceptDrops}
			ownerPlayerId={ownerPlayerId}
			canDragUnits={canDragUnits}
		/>
	);
	const quotaText =
		projectedSize != null && projectedSize !== size
			? `${size}/${cap} → ${projectedSize}/${cap}`
			: `${size}/${cap}`;
	return (
		<Box
			className="sylvenarr-panel"
			style={{
				flex: '1 1 280px',
				minWidth: 260,
				outline: isTurn ? '2px solid var(--copper, #E9C08F)' : undefined,
			}}
		>
			<Stack gap="sm">
				<Group justify="space-between" align="center" wrap="nowrap">
					{title}
					<Text size="sm" c="var(--app-text-muted)">
						{quotaText}
					</Text>
				</Group>
				<SimpleGrid cols={2} spacing="sm">
					{mirrorRows ? (
						<>
							{backZone}
							{frontZone}
						</>
					) : (
						<>
							{frontZone}
							{backZone}
						</>
					)}
				</SimpleGrid>
			</Stack>
		</Box>
	);
};

const SquadPreview = ({
	title,
	picks,
	fallbackUnits,
}: {
	title: string;
	picks: MatchDraftPick[];
	fallbackUnits?: ReadonlyArray<{ displayName: string; heroClassCode: string; id?: string }>;
}) => {
	const items =
		picks.length > 0
			? picks.map((pick) => ({
					key: pick.id,
					name: pick.displayName === 'Скрыто' || !pick.heroClassCode ? 'Скрыто' : pick.displayName,
				}))
			: (fallbackUnits ?? []).map((unit) => ({
					key: unit.id ?? `${unit.heroClassCode}-${unit.displayName}`,
					name: unit.displayName,
				}));
	return (
		<Box>
			<Text fw={700} mb={6}>
				{title}
			</Text>
			<ul className={draftStyles.squadsReadyList}>
				{items.length === 0 ? (
					<li>
						<Text size="sm" c="var(--app-text-muted)">
							—
						</Text>
					</li>
				) : (
					items.map((item) => (
						<li key={item.key}>
							<Text size="sm">{item.name}</Text>
						</li>
					))
				)}
			</ul>
		</Box>
	);
};

const statusLabel = (status: Match['status']): string => {
	switch (status) {
		case 'waiting':
			return 'ожидание соперника';
		case 'ready':
			return 'готово (устаревший)';
		case 'drafting':
			return 'набор отряда';
		case 'drafted':
			return 'составы готовы';
		case 'fighting':
			return 'бой';
		case 'finished':
			return 'бой завершён';
		case 'cancelled':
			return 'отменён';
		default:
			return status;
	}
};
