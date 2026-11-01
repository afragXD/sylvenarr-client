import { Anchor, Box, Button, Loader, Stack, Table, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { fetchMyMatches, type MatchHistoryItem, peekMyMatchesCache } from '@/entities/match';
import { fetchCurrentPlayer, type Player, playerUpdated } from '@/entities/player';
import { ApiError } from '@/shared/api/http';
import { formatDuration } from '@/shared/lib/formatDuration';
import { getMatchResultColor } from '@/shared/lib/stats';
import { OrnateFrame } from '@/shared/ui/OrnateFrame';
import { PageFrame } from '@/shared/ui/PageFrame';
import { PlayerIdentity } from '@/shared/ui/PlayerAvatar';

import styles from './MatchHistoryPage.module.css';

/**
 * История завершённых матчей текущего игрока (AC-6: кеш, Link+›, без battle.webp).
 */
export const MatchHistoryPage = () => {
	const cached = peekMyMatchesCache();
	const [player, setPlayer] = useState<Player | null>(null);
	const [sessionChecked, setSessionChecked] = useState(false);
	const [rows, setRows] = useState<MatchHistoryItem[]>(() => cached ?? []);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(() => cached === null);

	useEffect(() => {
		let mounted = true;
		void fetchCurrentPlayer()
			.then((me) => {
				if (!mounted) {
					return;
				}
				setPlayer(me);
				if (me) {
					playerUpdated(me);
				}
			})
			.catch(() => {
				if (mounted) {
					setPlayer(null);
				}
			})
			.finally(() => {
				if (mounted) {
					setSessionChecked(true);
				}
			});
		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		if (!sessionChecked || !player) {
			return;
		}
		let mounted = true;
		const hadCache = peekMyMatchesCache() !== null;
		if (!hadCache) {
			setLoading(true);
		}
		setError(null);
		void fetchMyMatches()
			.then((items) => {
				if (mounted) {
					setRows(items);
				}
			})
			.catch((err: unknown) => {
				if (mounted) {
					setError(err instanceof ApiError ? err.message : 'Не удалось загрузить историю');
				}
			})
			.finally(() => {
				if (mounted) {
					setLoading(false);
				}
			});
		return () => {
			mounted = false;
		};
	}, [sessionChecked, player]);

	return (
		<PageFrame
			width="wide"
			eyebrow="Арена"
			title="Мои матчи"
			lead="Завершённые бои: соперник, результат, длительность."
		>
			{!sessionChecked && <Loader color="brand" size="sm" />}
			{sessionChecked && !player && (
				<Stack gap="md" maw={480} className="sylvenarr-panel" p="md">
					<Text c="var(--app-text-muted)">Войдите, чтобы видеть историю матчей.</Text>
					<Button
						className="sylvenarr-plate-btn"
						color="brand"
						component={Link}
						to="/sign-in"
						search={{ redirect: '/matches' }}
					>
						Войти и играть
					</Button>
				</Stack>
			)}
			{player && loading && rows.length === 0 && <Loader color="brand" size="sm" />}
			{player && error && rows.length === 0 && (
				<Text c="var(--app-text-muted)" role="alert">
					{error}
				</Text>
			)}
			{player && !loading && !error && rows.length === 0 && (
				<Text c="var(--app-text-muted)">
					Пока нет завершённых матчей.{' '}
					<Anchor component={Link} to="/lobby" c="brand">
						В лобби
					</Anchor>
				</Text>
			)}
			{player && rows.length > 0 && (
				<OrnateFrame variant="panel">
					<Box style={{ overflowX: 'auto' }} p="sm">
						<Table
							className="sylvenarr-registry-table"
							horizontalSpacing="md"
							verticalSpacing="sm"
							style={{ borderCollapse: 'collapse', minWidth: 560 }}
						>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Дата</Table.Th>
									<Table.Th>Соперник</Table.Th>
									<Table.Th>Результат</Table.Th>
									<Table.Th>Время боя</Table.Th>
									<Table.Th w={36} aria-label="Открыть" />
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{rows.map((row) => (
									<Table.Tr key={row.id} className={styles.row}>
										<Table.Td colSpan={5} p={0} style={{ borderBottom: '1px solid var(--app-border)' }}>
											<Link
												to="/matches/$matchId"
												params={{ matchId: row.id }}
												className={styles.rowLink}
											>
												<span className={`${styles.cell} sylvenarr-tabular`}>{new Date(row.finishedAt).toLocaleString('ru-RU')}</span>
												<span className={styles.cell}>
													<PlayerIdentity
														name={row.opponentName}
														avatarUrl={row.opponentAvatarUrl}
														size={28}
													/>
												</span>
												<span
													className={styles.cell}
													style={{
														color: getMatchResultColor(row.result),
														fontWeight: row.result === 'draw' ? undefined : 600,
													}}
												>
													{resultLabel(row.result)}
												</span>
												<span className={`${styles.cell} sylvenarr-tabular`}>
													{formatDuration(row.durationSeconds)}
												</span>
												<span className={styles.chevron} aria-hidden>
													›
												</span>
											</Link>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</Box>
				</OrnateFrame>
			)}
		</PageFrame>
	);
};

const resultLabel = (result: MatchHistoryItem['result']): string => {
	if (result === 'win') {
		return 'Победа';
	}
	if (result === 'loss') {
		return 'Поражение';
	}
	return 'Ничья';
};

export { formatDuration } from '@/shared/lib/formatDuration';
