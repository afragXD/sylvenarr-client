import { Box, Group, Loader, Stack, Table, Text } from '@mantine/core';
import { type LucideIcon, Medal, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

import { fetchRating, type RatingRow } from '@/entities/rating';
import { ApiError } from '@/shared/api/http';
import { getPtsColor, getPtsTrendMark, START_PTS } from '@/shared/lib/stats';
import { PageFrame } from '@/shared/ui/PageFrame';
import { PlayerIdentity } from '@/shared/ui/PlayerAvatar';

const TOP_RANK_ICONS: Record<number, { Icon: LucideIcon; color: string }> = {
	1: { Icon: Trophy, color: '#CBB48C' },
	2: { Icon: Medal, color: '#9AA3AD' },
	3: { Icon: Medal, color: '#8E2A22' },
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
		<PageFrame
			width="wide"
			eyebrow="Арена"
			title="Рейтинг ПТС"
			lead={`Все начинают с ${START_PTS}. Победа над сильным даёт больше, ничья тоже считается.`}
		>
			<Stack gap={8}>
				<Text c="var(--app-text-muted)" style={{ lineHeight: 1.55 }}>
					У каждого игрока есть очки рейтинга — ПТС. Это главный показатель силы в таблице: чем выше
					число, тем выше место. Новый игрок начинает с {START_PTS} — это «нулевой» уровень, от
					которого растут и падают очки после боёв.
				</Text>
				<Text c="var(--app-text-muted)" style={{ lineHeight: 1.55 }}>
					После победы вы получаете ПТС, после поражения — теряете. Объём обмена зависит от разницы
					рейтингов: победа над более сильным соперником даёт заметный прирост, а ему — ощутимый
					штраф; победа над слабым приносит мало, и он теряет немного. Так система не даёт
					бесконечно набивать очки на лёгких матчах и награждает апсеты.
				</Text>
				<Text c="var(--app-text-muted)" style={{ lineHeight: 1.55 }}>
					Ничья не обнуляет результат: очки слегка сдвигаются в сторону выравнивания — у кого
					рейтинг ниже, тот чуть прибавляет, у кого выше — чуть отдаёт. Если рейтинги равны, ничья
					ничего не меняет. Ниже нуля опуститься нельзя: даже серия поражений остановится на полу.
				</Text>
				<Text c="var(--app-text-muted)" style={{ lineHeight: 1.55 }}>
					В таблице рядом с ПТС — счёт побед, поражений и ничьих за все учтённые бои. Сортировка
					идёт по очкам: сначала те, кто выше по ПТС.
				</Text>
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
				<Text c="var(--app-text-muted)">Пока нет записей — сыграйте первый бой.</Text>
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
								<Table.Th>ПТС</Table.Th>
								<Table.Th>Победы</Table.Th>
								<Table.Th>Поражения</Table.Th>
								<Table.Th>Ничьи</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{rows.map((row, index) => {
								const rank = index + 1;
								const meta = TOP_RANK_ICONS[rank];
								const ptsMark = getPtsTrendMark(row.pts);
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
										<Table.Td>
											<PlayerIdentity name={row.displayName} avatarUrl={row.avatarUrl} size={28} />
										</Table.Td>
										<Table.Td
											ff="monospace"
											c={getPtsColor(row.pts)}
											fw={700}
											style={{ fontVariantNumeric: 'tabular-nums' }}
											title={
												row.pts > START_PTS
													? 'Выше нулевого уровня 1500'
													: row.pts < START_PTS
														? 'Ниже нулевого уровня 1500'
														: 'Нулевой уровень 1500'
											}
										>
											{ptsMark ? `${ptsMark} ${row.pts}` : row.pts}
										</Table.Td>
										<Table.Td ff="monospace" style={{ fontVariantNumeric: 'tabular-nums' }}>
											{row.wins}
										</Table.Td>
										<Table.Td
											ff="monospace"
											c="var(--app-text-muted)"
											style={{ fontVariantNumeric: 'tabular-nums' }}
										>
											{row.losses}
										</Table.Td>
										<Table.Td
											ff="monospace"
											c="var(--app-text-muted)"
											style={{ fontVariantNumeric: 'tabular-nums' }}
										>
											{row.draws}
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
