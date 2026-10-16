import { Anchor, Box, Loader, Stack, Table, Text, Title } from '@mantine/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { fetchMyMatches, type MatchHistoryItem } from '@/entities/match';
import { ApiError } from '@/shared/api/http';
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
		<PageFrame width="wide">
			<Stack gap={6} maw={640}>
				<Title order={1}>Мои матчи</Title>
				<Text c="var(--app-text-muted)">Завершённые бои: соперник, результат, длительность.</Text>
			</Stack>
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
				<Box style={{ overflowX: 'auto' }}>
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
									<Table.Td c="var(--app-text-muted)" ff="monospace" size="sm">
										{new Date(row.finishedAt).toLocaleString('ru-RU')}
									</Table.Td>
									<Table.Td fw={600}>{row.opponentName}</Table.Td>
									<Table.Td c={row.result === 'win' ? 'accent' : undefined}>
										{resultLabel(row.result)}
									</Table.Td>
									<Table.Td ff="monospace" size="sm">
										{formatDuration(row.durationSeconds)}
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</Box>
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
