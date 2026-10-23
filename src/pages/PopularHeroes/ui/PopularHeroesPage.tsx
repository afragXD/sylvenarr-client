import { Anchor, Box, Group, Loader, Stack, Table, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { type LucideIcon, Medal, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

import { type FavoriteHeroStat, fetchFavoriteHeroes, HeroImage } from '@/entities/hero';
import { ApiError } from '@/shared/api/http';
import { PageFrame } from '@/shared/ui/PageFrame';

const TOP_RANK_ICONS: Record<number, { Icon: LucideIcon; color: string }> = {
	1: { Icon: Trophy, color: '#CBB48C' },
	2: { Icon: Medal, color: '#9AA3AD' },
	3: { Icon: Medal, color: '#8E2A22' },
};

/**
 * Глобальный рейтинг героев по числу выборов на арене.
 */
export const PopularHeroesPage = () => {
	const [rows, setRows] = useState<FavoriteHeroStat[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		void fetchFavoriteHeroes(24)
			.then((items) => {
				if (mounted) {
					setRows(items);
					setError(null);
				}
			})
			.catch((err) => {
				if (mounted) {
					setError(err instanceof ApiError ? err.message : 'Ошибка загрузки');
				}
			})
			.finally(() => {
				if (mounted) {
					setIsLoading(false);
				}
			});
		return () => {
			mounted = false;
		};
	}, []);

	return (
		<PageFrame
			width="wide"
			eyebrow="Каталог"
			title="Популярные герои"
			lead="Кого чаще всего берут в отряд на арене."
		>
			<Stack gap="md">
				<Anchor component={Link} to="/heroes" size="sm" c="brand" w="fit-content">
					← Реестр героев
				</Anchor>
				{isLoading && (
					<Group gap="sm">
						<Loader color="brand" size="sm" />
						<Text size="sm" c="var(--app-text-muted)">
							Загрузка…
						</Text>
					</Group>
				)}
				{error ? (
					<Text c="red" role="alert">
						{error}
					</Text>
				) : null}
				{!isLoading && !error && rows.length === 0 ? (
					<Text c="var(--app-text-muted)">Пока нет данных по выборам.</Text>
				) : null}
				{!isLoading && rows.length > 0 ? (
					<Box style={{ overflowX: 'auto' }}>
						<Table
							className="sylvenarr-registry-table"
							highlightOnHover
							horizontalSpacing="md"
							verticalSpacing="sm"
							style={{ borderCollapse: 'collapse', minWidth: 420 }}
						>
							<Table.Thead>
								<Table.Tr>
									<Table.Th w={80}>#</Table.Th>
									<Table.Th>Герой</Table.Th>
									<Table.Th>Выборы</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{rows.map((row, index) => {
									const rank = index + 1;
									const meta = TOP_RANK_ICONS[rank];
									return (
										<Table.Tr
											key={row.code}
											style={{ borderBottom: '1px solid var(--app-border)' }}
										>
											<Table.Td>
												<Group gap={6} wrap="nowrap" align="center">
													{meta ? (
														<meta.Icon
															size={16}
															strokeWidth={1.75}
															color={meta.color}
															fill={meta.color}
															fillOpacity={0.22}
															aria-hidden
														/>
													) : null}
													<Text span ff="monospace" c="var(--app-text-muted)">
														{rank}
													</Text>
												</Group>
											</Table.Td>
											<Table.Td>
												<Group gap="sm" wrap="nowrap">
													<HeroImage
														code={row.code}
														alt={row.displayName}
														variant="portrait"
														w={40}
														h={40}
													/>
													<Anchor
														component={Link}
														to={`/heroes/${row.code}`}
														c="var(--app-text)"
														underline="never"
													>
														{row.displayName}
													</Anchor>
												</Group>
											</Table.Td>
											<Table.Td
												ff="monospace"
												fw={700}
												style={{ fontVariantNumeric: 'tabular-nums' }}
											>
												{row.pickCount}
											</Table.Td>
										</Table.Tr>
									);
								})}
							</Table.Tbody>
						</Table>
					</Box>
				) : null}
			</Stack>
		</PageFrame>
	);
};
