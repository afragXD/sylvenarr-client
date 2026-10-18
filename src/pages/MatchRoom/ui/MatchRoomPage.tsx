import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Anchor, Box, Button, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { fetchHeroes, type HeroClass } from '@/entities/hero';
import {
	battleAction,
	cancelMatch,
	draftPick,
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

const POLL_MS = 2500;

const battleWsUrl = (matchId: string): string => {
	const wsBase = API_BASE_URL.replace(/^http/i, 'ws');
	return `${wsBase}/matches/ws/${encodeURIComponent(matchId)}`;
};
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

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
	);

	useEffect(() => {
		let isMounted = true;
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
		if (!activeMatchId || activeMatchStatus === 'cancelled' || activeMatchStatus === 'finished') {
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

	useEffect(() => {
		if (!activeMatchId || (activeMatchStatus !== 'fighting' && activeMatchStatus !== 'finished')) {
			return;
		}
		let socket: WebSocket | null = null;
		let closed = false;
		try {
			socket = new WebSocket(battleWsUrl(activeMatchId));
		} catch {
			return;
		}
		socket.addEventListener('open', () => {
			socket?.send(JSON.stringify({ type: 'join' }));
		});
		socket.addEventListener('message', (event) => {
			if (closed) {
				return;
			}
			try {
				const payload = JSON.parse(String(event.data)) as {
					type?: string;
					battle?: Match['battle'];
				};
				if (
					(payload.type === 'battle:state' || payload.type === 'battle:ended') &&
					payload.battle
				) {
					const battle = payload.battle;
					setMatch((prev) => {
						if (!prev) {
							return prev;
						}
						const nextStatus =
							payload.type === 'battle:ended' || battle.outcome !== 'ongoing'
								? 'finished'
								: prev.status === 'fighting'
									? 'fighting'
									: prev.status;
						return {
							...prev,
							status: nextStatus,
							winnerPlayerId: battle.winnerPlayerId ?? prev.winnerPlayerId,
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
					});
				}
			} catch {
				/* ignore malformed frames */
			}
		});
		return () => {
			closed = true;
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

	const handleBattleAction = async (input: {
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
		try {
			const next = await battleAction({ matchId: match.id, ...input });
			setMatch(next);
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Ошибка хода');
		} finally {
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
		(player.id === match.host.id || player.id === match.guest?.id);

	return (
		<PageFrame width="wide">
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
								<Text size="sm" c="var(--app-text-muted)">
									Игрок 1: {match.host.displayName}
								</Text>
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
									onAction={(input) => void handleBattleAction(input)}
								/>
								{match.status === 'finished' && (
									<Group gap="sm">
										<Button color="brand" onClick={() => void navigate({ to: '/lobby' })}>
											В лобби
										</Button>
										<Button
											variant="light"
											color="brand"
											onClick={() => void navigate({ to: '/matches' })}
										>
											Мои матчи
										</Button>
									</Group>
								)}
							</Stack>
						</Box>
					)}

					{match.status === 'drafting' && (
						<>
							<Group align="stretch" gap="xl" wrap="wrap" preventGrowOverflow={false}>
								<TeamPanel
									title={`Игрок 1 · ${match.host.displayName}`}
									ownerPlayerId={match.host.id}
									size={match.draft.hostSize}
									cap={match.draft.initialTeamSize}
									picks={match.draft.hostPicks}
									isTurn={match.draft.turnPlayerId === match.host.id}
									acceptDrops={player.id === match.host.id && !isBusy}
									canDragUnits={canDragUnits && player.id === match.host.id}
									mirrorRows
								/>
								<TeamPanel
									title={`Игрок 2 · ${match.guest?.displayName ?? '…'}`}
									ownerPlayerId={match.guest?.id ?? 'guest'}
									size={match.draft.guestSize}
									cap={match.draft.initialTeamSize}
									picks={match.draft.guestPicks}
									isTurn={match.draft.turnPlayerId === match.guest?.id}
									acceptDrops={Boolean(match.guest) && player.id === match.guest?.id && !isBusy}
									canDragUnits={
										canDragUnits && Boolean(match.guest) && player.id === match.guest?.id
									}
								/>
							</Group>

							<Stack gap="md">
								<Group justify="space-between" align="center" wrap="wrap" gap="sm">
									<Text fw={600}>
										{isMyTurn
											? `Ваш ход · квота ${mySize}/${match.draft.initialTeamSize}. Перетащите героя на ряд.`
											: 'Ход соперника…'}
									</Text>
									<Button
										variant="light"
										color="accent"
										loading={isBusy}
										disabled={!isMyTurn}
										onClick={() => void handleRandom()}
									>
										Случайно
									</Button>
								</Group>
								{error && (
									<Text c="red" role="alert">
										{error}
									</Text>
								)}
								<Text size="sm" c="var(--app-text-muted)">
									Цифра в углу карточки — сколько слотов герой занимает в отряде: I — один, II —
									два.
								</Text>
								<SimpleGrid
									cols={{ base: 3, sm: 4, md: 6, lg: 8 }}
									spacing="lg"
									verticalSpacing="lg"
								>
									{[...heroes]
										.sort(
											(a, b) => b.size - a.size || a.displayName.localeCompare(b.displayName, 'ru'),
										)
										.map((hero) => {
											const freeSlots = match.draft.initialTeamSize - mySize;
											const fits = hero.size <= freeSlots;
											const ownCodes = new Set(
												[...match.draft.hostPicks, ...match.draft.guestPicks]
													.filter((pick) => pick.playerId === player?.id)
													.map((pick) => pick.heroClassCode),
											);
											const allCodes = new Set(
												[...match.draft.hostPicks, ...match.draft.guestPicks].map(
													(pick) => pick.heroClassCode,
												),
											);
											const blockedByDupes =
												(match.rules.heroDupes === 'uniqueTeam' && ownCodes.has(hero.code)) ||
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
													onOpen={setModalHeroCode}
												/>
											);
										})}
								</SimpleGrid>
							</Stack>
						</>
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
		</PageFrame>
	);
};

const TeamPanel = ({
	title,
	ownerPlayerId,
	size,
	cap,
	picks,
	isTurn,
	acceptDrops,
	canDragUnits,
	mirrorRows = false,
}: {
	title: string;
	ownerPlayerId: string;
	size: number;
	cap: number;
	picks: MatchDraftPick[];
	isTurn: boolean;
	acceptDrops: boolean;
	canDragUnits: boolean;
	/** Игрок 1: задний слева, передний справа (фронты к центру). */
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
	return (
		<Box
			className="sylvenarr-panel"
			style={{
				flex: '1 1 280px',
				minWidth: 260,
				outline: isTurn ? '2px solid var(--mantine-color-accent-filled)' : undefined,
			}}
		>
			<Stack gap="sm">
				<Group justify="space-between">
					<Text fw={600}>{title}</Text>
					<Text size="sm" c="var(--app-text-muted)">
						{size}/{cap}
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
