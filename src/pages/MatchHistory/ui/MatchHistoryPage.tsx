import { Anchor, Box, Loader, Table, Text } from '@mantine/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { fetchMyMatches, type MatchHistoryItem } from '@/entities/match';
import { ApiError } from '@/shared/api/http';
import { getSceneUrl } from '@/shared/lib/staticUrl';
import { getMatchResultColor } from '@/shared/lib/stats';
import { OrnateFrame } from '@/shared/ui/OrnateFrame';
import { PageFrame } from '@/shared/ui/PageFrame';

/**
 * История завершённых матчей текущего игрока.
 */
export const MatchHistoryPage = () => {
	const navigate = useNavigate();
	const [rows, setRows] = useState<MatchHistoryItem[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
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
	}, []);

	return (
		<PageFrame
			width="wide"
			eyebrow="Арена"
			title="Мои матчи"
			lead="Завершённые бои: соперник, результат, длительность."
			scene={getSceneUrl('battle.webp')}
		>
			{loading && <Loader color="brand" size="sm" />}
			{error && (
				<Text c="red" role="alert">
					{error}
				</Text>
			)}
			{!loading && !error && rows.length === 0 && (
				<Text c="var(--app-text-muted)">
					Пока нет завершённых матчей.{' '}
					<Anchor component={Link} to="/lobby" c="brand">
						В лобби
					</Anchor>
				</Text>
			)}
			{rows.length > 0 && (
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
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{rows.map((row) => (
									<Table.Tr
										key={row.id}
										style={{ borderBottom: '1px solid var(--app-border)', cursor: 'pointer' }}
										onClick={() =>
											void navigate({ to: '/matches/$matchId', params: { matchId: row.id } })
										}
									>
										<Table.Td c="var(--app-text-muted)" className="sylvenarr-tabular" size="sm">
											{new Date(row.finishedAt).toLocaleString('ru-RU')}
										</Table.Td>
										<Table.Td fw={600}>{row.opponentName}</Table.Td>
										<Table.Td
											c={getMatchResultColor(row.result)}
											fw={row.result === 'draw' ? undefined : 600}
										>
											{resultLabel(row.result)}
										</Table.Td>
										<Table.Td className="sylvenarr-tabular" size="sm">
											{formatDuration(row.durationSeconds)}
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

export const formatDuration = (seconds: number | null): string => {
	if (seconds === null || seconds < 0) {
		return '—';
	}
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${String(s).padStart(2, '0')}`;
};
