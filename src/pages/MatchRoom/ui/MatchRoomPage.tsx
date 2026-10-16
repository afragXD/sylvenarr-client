import {
	Anchor,
	Box,
	Button,
	Group,
	SimpleGrid,
	Stack,
	Text,
	Title,
	UnstyledButton,
} from '@mantine/core';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { fetchHeroes, HeroImage, type HeroClass } from '@/entities/hero';
import {
	cancelMatch,
	draftPick,
	draftRandom,
	fetchMatchById,
	type Match,
	type MatchDraftPick,
} from '@/entities/match';
import { fetchCurrentPlayer, type Player } from '@/entities/player';
import { ApiError } from '@/shared/api/http';
import { PageFrame } from '@/shared/ui/PageFrame';

const POLL_MS = 2500;
const ROW_FRONT = 0;
const ROW_BACK = 1;

export const MatchRoomPage = () => {
	const { matchId } = useParams({ from: '/lobby/$matchId' });
	const navigate = useNavigate();
	const [player, setPlayer] = useState<Player | null>(null);
	const [match, setMatch] = useState<Match | null>(null);
	const [heroes, setHeroes] = useState<HeroClass[]>([]);
	const [selectedRow, setSelectedRow] = useState(ROW_FRONT);
	const [error, setError] = useState<string | null>(null);
	const [isBusy, setIsBusy] = useState(false);
	const [bootError, setBootError] = useState<string | null>(null);

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

	useEffect(() => {
		if (!match || match.status === 'cancelled' || match.status === 'drafted') {
			return;
		}
		const timer = window.setInterval(() => {
			void fetchMatchById(match.id)
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
	}, [match]);

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

	const handlePick = async (heroCode: string) => {
		if (!match) {
			return;
		}
		setIsBusy(true);
		setError(null);
		try {
			const next = await draftPick({
				matchId: match.id,
				heroCode,
				row: selectedRow,
			});
			setMatch(next);
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Ошибка выбора');
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
			const next = await draftRandom({ matchId: match.id, row: selectedRow });
			setMatch(next);
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Ошибка случайного выбора');
		} finally {
			setIsBusy(false);
		}
	};

	const isHost = Boolean(player && match && player.id === match.host.id);
	const isMyTurn =
		Boolean(player && match?.status === 'drafting' && match.draft.turnPlayerId === player.id);
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

	return (
		<PageFrame width="wide">
			<Stack gap="lg" w="100%">
				<Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
					<Stack gap={6} maw={560}>
						<Anchor component={Link} to="/lobby" c="brand" fw={600} size="sm">
							← Лобби
						</Anchor>
						<Title order={1}>Матч</Title>
						<Text c="var(--app-text-muted)">
							Статус: {statusLabel(match.status)}. Код:{' '}
							<Text span ff="monospace" fw={700} c="var(--app-text)">
								{match.inviteCode}
							</Text>
						</Text>
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
								Передайте код другу. После входа начнётся draft — ход хоста.
							</Text>
							<Box className="sylvenarr-invite-plate">{match.inviteCode}</Box>
							<Text size="sm" c="var(--app-text-muted)">
								Хост: {match.host.displayName}
							</Text>
						</Stack>
					</Box>
				)}

				{(match.status === 'drafting' || match.status === 'drafted') && (
					<>
						<Group align="stretch" gap="xl" wrap="wrap" preventGrowOverflow={false}>
							<TeamPanel
								title={`Хост · ${match.host.displayName}`}
								size={match.draft.hostSize}
								cap={match.draft.initialTeamSize}
								picks={match.draft.hostPicks}
								isTurn={match.draft.turnPlayerId === match.host.id}
							/>
							<TeamPanel
								title={`Гость · ${match.guest?.displayName ?? '…'}`}
								size={match.draft.guestSize}
								cap={match.draft.initialTeamSize}
								picks={match.draft.guestPicks}
								isTurn={match.draft.turnPlayerId === match.guest?.id}
							/>
						</Group>

						{match.status === 'drafted' && (
							<Box className="sylvenarr-panel" maw={560}>
								<Text fw={600} c="accent">
									Составы готовы. Бой — фаза 3.
								</Text>
								<Button
									mt="md"
									variant="light"
									color="brand"
									onClick={() => void navigate({ to: '/lobby' })}
								>
									Вернуться в лобби
								</Button>
							</Box>
						)}

						{match.status === 'drafting' && (
							<Stack gap="md">
								<Group justify="space-between" align="center" wrap="wrap" gap="sm">
									<Text fw={600}>
										{isMyTurn
											? `Ваш ход · квота ${mySize}/${match.draft.initialTeamSize}`
											: 'Ход соперника…'}
									</Text>
									<Group gap="xs">
										<Button
											variant={selectedRow === ROW_FRONT ? 'filled' : 'light'}
											color="brand"
											size="compact-sm"
											onClick={() => setSelectedRow(ROW_FRONT)}
										>
											Передний ряд
										</Button>
										<Button
											variant={selectedRow === ROW_BACK ? 'filled' : 'light'}
											color="brand"
											size="compact-sm"
											onClick={() => setSelectedRow(ROW_BACK)}
										>
											Задний ряд
										</Button>
										<Button
											variant="light"
											color="accent"
											loading={isBusy}
											disabled={!isMyTurn}
											onClick={() => void handleRandom()}
										>
											Random
										</Button>
									</Group>
								</Group>
								{error && (
									<Text c="red" role="alert">
										{error}
									</Text>
								)}
								<SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing="sm">
									{heroes.map((hero) => {
										const fits =
											mySize + hero.size <= match.draft.initialTeamSize;
										return (
											<UnstyledButton
												key={hero.code}
												disabled={!isMyTurn || isBusy || !fits}
												onClick={() => void handlePick(hero.code)}
												style={{
													opacity: !isMyTurn || !fits ? 0.45 : 1,
													cursor:
														isMyTurn && fits && !isBusy
															? 'pointer'
															: 'default',
													border:
														'1px solid color-mix(in srgb, var(--app-text) 12%, transparent)',
													borderRadius: 8,
													padding: 8,
													background: 'var(--app-surface)',
													textAlign: 'left',
												}}
											>
												<Stack gap={6}>
													<HeroImage
														code={hero.code}
														alt={hero.displayName}
														w="100%"
														h={72}
													/>
													<Text size="sm" fw={600} lineClamp={1}>
														{hero.displayName}
													</Text>
													<Text size="xs" c="var(--app-text-muted)">
														size {hero.size}
													</Text>
												</Stack>
											</UnstyledButton>
										);
									})}
								</SimpleGrid>
							</Stack>
						)}
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
		</PageFrame>
	);
};

const TeamPanel = ({
	title,
	size,
	cap,
	picks,
	isTurn,
}: {
	title: string;
	size: number;
	cap: number;
	picks: MatchDraftPick[];
	isTurn: boolean;
}) => {
	const front = picks.filter((pick) => pick.row === ROW_FRONT);
	const back = picks.filter((pick) => pick.row === ROW_BACK);
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
				<RowLabel label="Передний ряд" picks={front} />
				<RowLabel label="Задний ряд" picks={back} />
			</Stack>
		</Box>
	);
};

const RowLabel = ({ label, picks }: { label: string; picks: MatchDraftPick[] }) => (
	<Stack gap={4}>
		<Text size="xs" c="var(--app-text-muted)" tt="uppercase">
			{label}
		</Text>
		{picks.length === 0 ? (
			<Text size="sm" c="var(--app-text-muted)">
				—
			</Text>
		) : (
			<Group gap="xs" wrap="wrap">
				{picks.map((pick) => (
					<Group key={pick.id} gap={6} wrap="nowrap">
						<HeroImage code={pick.heroClassCode} alt={pick.displayName} w={36} h={36} />
						<Text size="sm">
							{pick.displayName}
							{pick.size > 1 ? ` (${pick.size})` : ''}
						</Text>
					</Group>
				))}
			</Group>
		)}
	</Stack>
);

const statusLabel = (status: Match['status']): string => {
	switch (status) {
		case 'waiting':
			return 'ожидание соперника';
		case 'ready':
			return 'готово (устаревший)';
		case 'drafting':
			return 'draft';
		case 'drafted':
			return 'составы готовы';
		case 'cancelled':
			return 'отменён';
		default:
			return status;
	}
};
