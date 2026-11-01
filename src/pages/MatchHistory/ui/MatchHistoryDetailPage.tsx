import { Anchor, Box, Button, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { HeroImage } from '@/entities/hero';
import {
	fetchMyMatchDetail,
	type MatchHistoryDetail,
	type MatchHistoryTeam,
	type MatchHistoryUnit,
} from '@/entities/match';
import { fetchCurrentPlayer, playerUpdated } from '@/entities/player';
import { CombatStat, CombatStatRow, renderBattleLogLine } from '@/features/battle';
import { ApiError } from '@/shared/api/http';
import { formatDuration } from '@/shared/lib/formatDuration';
import { getMatchResultColor } from '@/shared/lib/stats';
import { PageFrame } from '@/shared/ui/PageFrame';
import { PlayerIdentity } from '@/shared/ui/PlayerAvatar';

import styles from './MatchHistoryDetailPage.module.css';

const ROW_FRONT = 0;
const ROW_BACK = 1;

/**
 * Карточка завершённого матча: составы, статы, лог.
 */
export const MatchHistoryDetailPage = () => {
	const { matchId } = useParams({ from: '/matches/$matchId' });
	const [signedIn, setSignedIn] = useState<boolean | null>(null);
	const [detail, setDetail] = useState<MatchHistoryDetail | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let mounted = true;
		void fetchCurrentPlayer()
			.then((me) => {
				if (!mounted) {
					return;
				}
				setSignedIn(Boolean(me));
				if (me) {
					playerUpdated(me);
				}
			})
			.catch(() => {
				if (mounted) {
					setSignedIn(false);
				}
			});
		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		if (signedIn !== true) {
			return;
		}
		let mounted = true;
		setLoading(true);
		setError(null);
		void fetchMyMatchDetail(matchId)
			.then((item) => {
				if (mounted) {
					setDetail(item);
				}
			})
			.catch((err: unknown) => {
				if (mounted) {
					if (err instanceof ApiError && err.status === 401) {
						setSignedIn(false);
						return;
					}
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
	}, [matchId, signedIn]);

	const returnPath = `/matches/${matchId}`;

	return (
		<PageFrame
			width="wide"
			eyebrow="Арена"
			title="Карточка матча"
			lead="Составы, статы и лог завершённого боя."
		>
			<Stack gap="md">
				{signedIn === false ? (
					<Stack gap="md" maw={480} className="sylvenarr-panel" p="md">
						<Text c="var(--app-text-muted)">Войдите, чтобы посмотреть матч.</Text>
						<Button
							className="sylvenarr-plate-btn"
							color="brand"
							component={Link}
							to="/sign-in"
							search={{ redirect: returnPath }}
						>
							Войти и играть
						</Button>
					</Stack>
				) : (
					<Anchor component={Link} to="/matches" c="brand" size="sm">
						← Мои матчи
					</Anchor>
				)}

				{signedIn === null && <Loader color="brand" size="sm" />}
				{signedIn === true && loading && <Loader color="brand" size="sm" />}
				{signedIn === true && error && (
					<Text c="var(--app-text-muted)" role="alert">
						{error}
					</Text>
				)}

				{detail && (
					<>
						<Stack gap={6} maw={720}>
							<Title order={1} c={getMatchResultColor(detail.result)}>
								{resultTitle(detail.result)}
							</Title>
							<Group gap="sm" wrap="wrap" align="center">
								<Text c="var(--app-text-muted)" component="span">
									Соперник:
								</Text>
								<PlayerIdentity
									name={detail.opponentName}
									avatarUrl={detail.opponentAvatarUrl}
									size={28}
								/>
								<Text c="var(--app-text-muted)" size="sm">
									{new Date(detail.finishedAt).toLocaleString('ru-RU')}
									{detail.durationSeconds !== null
										? ` · ${formatDuration(detail.durationSeconds)}`
										: ''}
									{detail.stage !== null ? ` · раундов: ${detail.stage}` : ''}
								</Text>
							</Group>
							{!detail.hasSnapshot && (
								<Text size="sm" c="var(--app-text-muted)">
									Подробности боя недоступны (матч до обновления). Показаны составы из набора.
								</Text>
							)}
						</Stack>

						<div className={styles.field}>
							<div className={styles.playerLabel} data-side="host">
								<PlayerIdentity
									name={detail.host.displayName}
									avatarUrl={detail.host.avatarUrl}
									prefix="Игрок 1"
									size={24}
								/>
							</div>
							<div className={styles.playerLabel} data-side="guest">
								<PlayerIdentity
									name={detail.guest.displayName}
									avatarUrl={detail.guest.avatarUrl}
									prefix="Игрок 2"
									size={24}
								/>
							</div>
							<RowColumn label="Задний ряд" units={unitsInRow(detail.host, ROW_BACK)} />
							<RowColumn label="Передний ряд" units={unitsInRow(detail.host, ROW_FRONT)} />
							<RowColumn label="Передний ряд" units={unitsInRow(detail.guest, ROW_FRONT)} />
							<RowColumn label="Задний ряд" units={unitsInRow(detail.guest, ROW_BACK)} />
						</div>

						{detail.hasSnapshot && detail.log.length > 0 && (
							<Box className={styles.logPanel}>
								<Text fw={600} mb="xs">
									Ход боя
								</Text>
								<div className={styles.log}>
									{detail.log.map((line, index) => (
										<span key={`${index}-${line}`}>{renderBattleLogLine(line)}</span>
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

const unitsInRow = (team: MatchHistoryTeam, row: number): MatchHistoryUnit[] =>
	team.units.filter((unit) => unit.row === row).sort((a, b) => a.column - b.column);

const RowColumn = ({ label, units }: { label: string; units: MatchHistoryUnit[] }) => (
	<div className={styles.column}>
		<Text size="xs" c="var(--app-text-muted)" className={styles.columnLabel}>
			{label}
		</Text>
		{units.length === 0 ? (
			<Text size="sm" c="var(--app-text-muted)">
				—
			</Text>
		) : (
			<div className={styles.columnUnits}>
				{units.map((unit) => (
					<UnitCard key={unit.pickId} unit={unit} />
				))}
			</div>
		)}
	</div>
);

const UnitCard = ({ unit }: { unit: MatchHistoryUnit }) => {
	const hasStats = unit.maxHp > 0;
	return (
		<div className={styles.unit} data-dead={unit.alive ? undefined : 'true'}>
			<Group gap={8} wrap="nowrap" align="flex-start">
				<HeroImage code={unit.heroClassCode} alt={unit.displayName} w={36} h={36} radius={0} />
				<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
					<Text fw={600} size="sm" lineClamp={1}>
						{unit.displayName}
					</Text>
					{hasStats ? (
						<>
							<CombatStatRow>
								<CombatStat
									kind="health"
									value={`${unit.health}/${unit.maxHp}`}
									muted={!unit.alive}
								/>
								{!unit.alive ? <CombatStat kind="fallen" /> : null}
							</CombatStatRow>
							<CombatStatRow>
								{typeof unit.lvl === 'number' ? (
									<CombatStat kind="level" value={unit.lvl} muted />
								) : null}
								<CombatStat kind="damage" value={unit.damage} muted />
								<CombatStat kind="armor" value={unit.armor} muted />
								<CombatStat kind="initiative" value={unit.initiative} muted />
							</CombatStatRow>
						</>
					) : (
						<Text size="xs" c="var(--app-text-muted)">
							Статы недоступны
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
