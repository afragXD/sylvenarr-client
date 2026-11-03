import { Box, Group, Loader, Stack, Table, Text, UnstyledButton } from '@mantine/core';
import { type LucideIcon, Medal, Trophy } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { fetchCurrentPlayer } from '@/entities/player';
import { fetchRating, type RatingRow } from '@/entities/rating';
import { ApiError } from '@/shared/api/http';
import { getPtsColor, getPtsTitle, START_PTS } from '@/shared/lib/stats';
import { PageFrame } from '@/shared/ui/PageFrame';
import { PlayerIdentity } from '@/shared/ui/PlayerAvatar';

import styles from './RatingPage.module.css';

const TOP_RANK_ICONS: Record<number, { Icon: LucideIcon; color: string }> = {
	1: { Icon: Trophy, color: '#CBB48C' },
	2: { Icon: Medal, color: '#9AA3AD' },
	3: { Icon: Medal, color: '#8E2A22' },
};

/** Индекс вставки разделителя 1500: после последнего ≥1500, иначе 0 или length. */
const thresholdInsertIndex = (items: RatingRow[]): number => {
	const firstBelow = items.findIndex((row) => row.pts < START_PTS);
	if (firstBelow === -1) {
		return items.length;
	}
	if (firstBelow === 0) {
		return 0;
	}
	return firstBelow;
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
	const myPts = myRank > 0 ? rows[myRank - 1]?.pts : undefined;
	const splitAt = useMemo(() => thresholdInsertIndex(rows), [rows]);

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

	const scrollToMe = () => {
		const node = myRowRef.current ?? myListRef.current;
		node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	};

	const renderPts = (pts: number, className: string) => (
		<span className={className} style={{ color: getPtsColor(pts) }} title={getPtsTitle(pts)}>
			{pts}
		</span>
	);

	const thresholdRow = (
		<Table.Tr key="pts-threshold" className={styles.thresholdRow}>
			<Table.Td colSpan={6}>
				<span className={styles.thresholdLabel}>1500 · стартовый уровень</span>
			</Table.Td>
		</Table.Tr>
	);

	const thresholdItem = (
		<li key="pts-threshold" className={styles.thresholdMobile} aria-hidden={false}>
			<span className={styles.thresholdLabel}>1500 · стартовый уровень</span>
		</li>
	);

	const desktopBody: ReactNode[] = [];
	const mobileBody: ReactNode[] = [];
	rows.forEach((row, index) => {
		if (index === splitAt) {
			desktopBody.push(thresholdRow);
			mobileBody.push(thresholdItem);
		}
		const rank = index + 1;
		const meta = TOP_RANK_ICONS[rank];
		const isYou = Boolean(myId && row.playerId === myId);
		desktopBody.push(
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
						<PlayerIdentity name={row.displayName} avatarUrl={row.avatarUrl} size={28} />
						{isYou ? <span className={styles.youBadge}>вы</span> : null}
					</Group>
				</Table.Td>
				<Table.Td ff="monospace" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
					{renderPts(row.pts, styles.ptsValue)}
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
			</Table.Tr>,
		);
		mobileBody.push(
			<li
				key={row.playerId}
				ref={isYou ? myListRef : undefined}
				className={[styles.mobileRow, isYou ? styles.youRow : null].filter(Boolean).join(' ')}
			>
				<span className={styles.mobileRank}>{rank}</span>
				<span className={styles.mobilePlayer}>
					<PlayerIdentity name={row.displayName} avatarUrl={row.avatarUrl} size={28} />
					{isYou ? <span className={styles.youBadge}>вы</span> : null}
				</span>
				{renderPts(row.pts, styles.mobilePts)}
			</li>,
		);
	});
	if (splitAt === rows.length && rows.length > 0) {
		desktopBody.push(thresholdRow);
		mobileBody.push(thresholdItem);
	}

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
							победы вы получаете ПТС, после поражения — теряете; объём зависит от разницы
							рейтингов.
						</Text>
						<Text c="var(--app-text-muted)" style={{ lineHeight: 1.55, maxWidth: '75ch' }}>
							Ничья слегка выравнивает очки. Ниже нуля опуститься нельзя. В таблице — ПТС и счёт
							побед, поражений и ничьих.
						</Text>
					</Stack>
				</details>
			</Stack>
			{myRank > 0 && myPts !== undefined ? (
				<p className={styles.myPlace}>
					Вы на <span className={styles.myPlaceNum}>{myRank}</span>-м месте из{' '}
					<span className={styles.myPlaceNum}>{rows.length}</span> ·{' '}
					{renderPts(myPts, styles.myPlaceNum)} ПТС
					{myRowOffscreen ? (
						<>
							{' · '}
							<UnstyledButton type="button" className={styles.showMe} onClick={scrollToMe}>
								Показать меня
							</UnstyledButton>
						</>
					) : null}
				</p>
			) : null}
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
								<Table.Tbody>{desktopBody}</Table.Tbody>
							</Table>
						</Box>
					</div>
					<ol className={styles.mobileList}>{mobileBody}</ol>
				</>
			)}
		</PageFrame>
	);
};
