import { Box, Group, Loader, Stack, Table, Text } from '@mantine/core';
import { type LucideIcon, Medal, Trophy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { fetchCurrentPlayer } from '@/entities/player';
import { fetchRating, type RatingRow } from '@/entities/rating';
import { ApiError } from '@/shared/api/http';
import { getPtsColor, getPtsTrendMark, START_PTS } from '@/shared/lib/stats';
import { PageFrame } from '@/shared/ui/PageFrame';
import { PlayerIdentity } from '@/shared/ui/PlayerAvatar';

import styles from './RatingPage.module.css';

const TOP_RANK_ICONS: Record<number, { Icon: LucideIcon; color: string }> = {
	1: { Icon: Trophy, color: '#CBB48C' },
	2: { Icon: Medal, color: '#9AA3AD' },
	3: { Icon: Medal, color: '#8E2A22' },
};

export const RatingPage = () => {
	const [rows, setRows] = useState<RatingRow[]>([]);
	const [myId, setMyId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [myRowOffscreen, setMyRowOffscreen] = useState(false);
	const myRowRef = useRef<HTMLTableRowElement | null>(null);
	const myListRef = useRef<HTMLLIElement | null>(null);

	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			try {
				const [items, me] = await Promise.all([fetchRating(), fetchCurrentPlayer()]);
				if (isMounted) {
					setRows(items);
					setMyId(me?.id ?? null);
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

	const myRank = myId ? rows.findIndex((row) => row.playerId === myId) + 1 : 0;

	useEffect(() => {
		const node = myRowRef.current ?? myListRef.current;
		if (!node || myRank <= 0) {
			setMyRowOffscreen(false);
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				setMyRowOffscreen(!entry?.isIntersecting);
			},
			{ root: null, threshold: 0 },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [myRank, rows.length, isLoading]);

	return (
		<PageFrame
			width="wide"
			eyebrow="Арена"
			title="Рейтинг ПТС"
			lead={`Все начинают с ${START_PTS}. Победа над сильным даёт больше, ничья тоже считается.`}
			compactOnMobile
		>
			<Stack gap={8} className={styles.explain}>
				<details className={styles.details}>
					<summary className={styles.summary}>Как считается ПТС?</summary>
					<Stack gap={8} mt="sm">
						<Text c="var(--app-text-muted)" style={{ lineHeight: 1.55, maxWidth: '75ch' }}>
							У каждого игрока есть очки рейтинга — ПТС. Новый игрок начинает с {START_PTS}. После
							победы вы получаете ПТС, после поражения — теряете; объём зависит от разницы рейтингов.
						</Text>
						<Text c="var(--app-text-muted)" style={{ lineHeight: 1.55, maxWidth: '75ch' }}>
							Ничья слегка выравнивает очки. Ниже нуля опуститься нельзя. В таблице — ПТС и счёт
							побед, поражений и ничьих.
						</Text>
					</Stack>
				</details>
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
				<>
					<div className={styles.desktopTable}>
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
										const isYou = Boolean(myId && row.playerId === myId);
										return (
											<Table.Tr
												key={row.playerId}
												ref={isYou ? myRowRef : undefined}
												className={isYou ? styles.youRow : undefined}
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
													<Group gap={8} wrap="nowrap">
														<PlayerIdentity
															name={row.displayName}
															avatarUrl={row.avatarUrl}
															size={28}
														/>
														{isYou ? <span className={styles.youBadge}>вы</span> : null}
													</Group>
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
					</div>
					{/* AC-9: 390×844 — список «место · игрок · ПТС», без горизонтального скролла */}
					<ol className={styles.mobileList}>
						{rows.map((row, index) => {
							const rank = index + 1;
							const ptsMark = getPtsTrendMark(row.pts);
							const isYou = Boolean(myId && row.playerId === myId);
							return (
								<li
									key={row.playerId}
									ref={isYou ? myListRef : undefined}
									className={[styles.mobileRow, isYou ? styles.youRow : null]
										.filter(Boolean)
										.join(' ')}
								>
									<span className={styles.mobileRank}>{rank}</span>
									<span className={styles.mobilePlayer}>
										<PlayerIdentity name={row.displayName} avatarUrl={row.avatarUrl} size={28} />
										{isYou ? <span className={styles.youBadge}>вы</span> : null}
									</span>
									<span
										className={styles.mobilePts}
										style={{ color: getPtsColor(row.pts) }}
									>
										{ptsMark ? `${ptsMark} ${row.pts}` : row.pts}
									</span>
								</li>
							);
						})}
					</ol>
				</>
			)}
			{myRank > 0 && myRowOffscreen ? (
				<div className={styles.stickyPlace} role="status">
					Ваше место: {myRank}
				</div>
			) : null}
		</PageFrame>
	);
};
