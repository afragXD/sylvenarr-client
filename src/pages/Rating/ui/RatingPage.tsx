import { Box, Group, Loader, Stack, Table, Text, Title } from '@mantine/core';
import { Medal, Trophy, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { fetchRating, type RatingRow } from '@/entities/rating';
import { ApiError } from '@/shared/api/http';
import { getWinrateColor } from '@/shared/lib/stats';
import { PageFrame } from '@/shared/ui/PageFrame';

const TOP_RANK_ICONS: Record<number, { Icon: LucideIcon; color: string }> = {
	1: { Icon: Trophy, color: '#C4A35A' },
	2: { Icon: Medal, color: '#9AA3AD' },
	3: { Icon: Medal, color: '#B07A4A' },
};

export const RatingPage = () => {
	const [rows, setRows] = useState<RatingRow[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			try {
				const items = await fetchRating();
				if (isMounted) {
					setRows(items);
					setError(null);
				}
			} catch (err) {
				if (isMounted) {
					setError(err instanceof ApiError ? err.message : 'Ошибка загрузки');
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};
		void load();
		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<PageFrame width="wide">
			<Stack gap={6} maw={640}>
				<Title order={1}>Рейтинг</Title>
				<Text c="var(--app-text-muted)">Победы / игры / винрейт (после завершения боёв).</Text>
			</Stack>
			{isLoading && (
				<Group gap="sm">
					<Loader color="brand" size="sm" />
					<Text size="sm" c="var(--app-text-muted)">
						Загрузка таблицы…
					</Text>
				</Group>
			)}
			{error && (
				<Text c="red" role="alert">
					{error}
				</Text>
			)}
			{!isLoading && !error && rows.length === 0 && (
				<Text c="var(--app-text-muted)">Пока нет записей — бои появятся в следующих фазах.</Text>
			)}
			{!isLoading && rows.length > 0 && (
				<Box style={{ overflowX: 'auto' }}>
					<Table
						className="sylvenarr-registry-table"
						highlightOnHover
						horizontalSpacing="md"
						verticalSpacing="sm"
						style={{ borderCollapse: 'collapse', minWidth: 560 }}
					>
						<Table.Thead>
							<Table.Tr>
								<Table.Th w={80}>#</Table.Th>
								<Table.Th>Игрок</Table.Th>
								<Table.Th>Победы</Table.Th>
								<Table.Th>Игры</Table.Th>
								<Table.Th>Винрейт</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{rows.map((row, index) => {
								const rank = index + 1;
								const meta = TOP_RANK_ICONS[rank];
								return (
									<Table.Tr
										key={row.playerId}
										style={{ borderBottom: '1px solid var(--app-border)' }}
									>
										<Table.Td>
											<Group gap={6} wrap="nowrap" align="center">
												{meta && (
													<meta.Icon
														size={16}
														strokeWidth={1.75}
														color={meta.color}
														fill={meta.color}
														fillOpacity={0.22}
														aria-hidden
													/>
												)}
												<Text span ff="monospace" c="var(--app-text-muted)">
													{rank}
												</Text>
											</Group>
										</Table.Td>
										<Table.Td fw={600}>{row.displayName}</Table.Td>
										<Table.Td ff="monospace" style={{ fontVariantNumeric: 'tabular-nums' }}>
											{row.wins}
										</Table.Td>
										<Table.Td
											ff="monospace"
											c="var(--app-text-muted)"
											style={{ fontVariantNumeric: 'tabular-nums' }}
										>
											{row.games}
										</Table.Td>
										<Table.Td
											ff="monospace"
											c={getWinrateColor(row.winrate)}
											fw={600}
											style={{ fontVariantNumeric: 'tabular-nums' }}
										>
											{row.winrate}%
										</Table.Td>
									</Table.Tr>
								);
							})}
						</Table.Tbody>
					</Table>
				</Box>
			)}
		</PageFrame>
	);
};
