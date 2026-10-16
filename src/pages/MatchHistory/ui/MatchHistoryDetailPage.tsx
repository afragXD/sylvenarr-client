import { Anchor, Box, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { HeroImage } from '@/entities/hero';
import {
	fetchMyMatchDetail,
	type MatchHistoryDetail,
	type MatchHistoryTeam,
	type MatchHistoryUnit,
} from '@/entities/match';
import { ApiError } from '@/shared/api/http';
import { PageFrame } from '@/shared/ui/PageFrame';
import styles from './MatchHistoryDetailPage.module.css';
import { formatDuration } from './MatchHistoryPage';

/**
 * Карточка завершённого матча: составы, статы, лог.
 */
export const MatchHistoryDetailPage = () => {
	const { matchId } = useParams({ from: '/matches/$matchId' });
	const [detail, setDetail] = useState<MatchHistoryDetail | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		void fetchMyMatchDetail(matchId)
			.then((item) => {
				if (mounted) {
					setDetail(item);
				}
			})
			.catch((err: unknown) => {
				if (mounted) {
					setError(err instanceof ApiError ? err.message : 'Не удалось загрузить матч');
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
	}, [matchId]);

	return (
		<PageFrame width="wide">
			<Stack gap="md">
				<Anchor component={Link} to="/matches" c="brand" size="sm">
					← Мои матчи
				</Anchor>

				{loading && <Loader color="brand" size="sm" />}
				{error && (
					<Text c="red" role="alert">
						{error}
					</Text>
				)}

				{detail && (
					<>
						<Stack gap={6} maw={720}>
							<Title order={1}>{resultTitle(detail.result)}</Title>
							<Text c="var(--app-text-muted)">
								Соперник: {detail.opponentName} ·{' '}
								{new Date(detail.finishedAt).toLocaleString('ru-RU')}
								{detail.durationSeconds !== null
									? ` · ${formatDuration(detail.durationSeconds)}`
									: ''}
								{detail.stage !== null ? ` · раундов: ${detail.stage}` : ''}
							</Text>
							{!detail.hasSnapshot && (
								<Text size="sm" c="var(--app-text-muted)">
									Подробности боя недоступны (матч до обновления). Показаны составы из draft.
								</Text>
							)}
						</Stack>

						<SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
							<TeamBlock title={`Игрок 1 · ${detail.host.displayName}`} team={detail.host} />
							<TeamBlock title={`Игрок 2 · ${detail.guest.displayName}`} team={detail.guest} />
						</SimpleGrid>

						{detail.hasSnapshot && detail.log.length > 0 && (
							<Box className={styles.logPanel}>
								<Text fw={600} mb="xs">
									Ход боя
								</Text>
								<div className={styles.log}>
									{detail.log.map((line) => (
										<div key={line}>{line}</div>
									))}
								</div>
							</Box>
						)}
					</>
				)}
			</Stack>
		</PageFrame>
	);
};

const TeamBlock = ({ title, team }: { title: string; team: MatchHistoryTeam }) => (
	<div className={styles.team}>
		<Text fw={700} mb="sm">
			{title}
		</Text>
		{team.units.length === 0 ? (
			<Text c="var(--app-text-muted)" size="sm">
				Нет данных о составе
			</Text>
		) : (
			<Stack gap="sm">
				{team.units.map((unit) => (
					<UnitCard key={unit.pickId} unit={unit} />
				))}
			</Stack>
		)}
	</div>
);

const UnitCard = ({ unit }: { unit: MatchHistoryUnit }) => {
	const hasStats = unit.maxHp > 0;
	return (
		<div className={styles.unit} data-dead={unit.alive ? undefined : 'true'}>
			<Group gap="sm" wrap="nowrap" align="flex-start">
				<HeroImage code={unit.heroClassCode} alt={unit.displayName} w={40} h={40} radius={0} />
				<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
					<Group justify="space-between" wrap="nowrap" gap="xs">
						<Text fw={600} lineClamp={1}>
							{unit.displayName}
						</Text>
						<Text size="xs" c="var(--app-text-muted)">
							{unit.row === 0 ? 'Передний' : 'Задний'}
						</Text>
					</Group>
					{hasStats ? (
						<>
							<Text size="sm" c={unit.alive ? undefined : 'var(--app-text-muted)'}>
								ОЗ {unit.health}/{unit.maxHp}
								{unit.alive ? '' : ' · пал'}
							</Text>
							<Text size="xs" c="var(--app-text-muted)">
								Урон {unit.damage} · Броня {unit.armor} · Иниц. {unit.initiative}
							</Text>
						</>
					) : (
						<Text size="sm" c="var(--app-text-muted)">
							Статы конца боя недоступны
						</Text>
					)}
				</Stack>
			</Group>
		</div>
	);
};

const resultTitle = (result: MatchHistoryDetail['result']): string => {
	if (result === 'win') {
		return 'Победа';
	}
	if (result === 'loss') {
		return 'Поражение';
	}
	return 'Ничья';
};
