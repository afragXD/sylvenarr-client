import { Button, Text } from '@mantine/core';
import { Crown, Equal, Skull } from 'lucide-react';
import type { ReactNode } from 'react';

import type { MatchMyRating } from '@/entities/match';
import { formatDuration } from '@/shared/lib/formatDuration';
import {
	getMatchResultColor,
	MATCH_RESULT_LOSS,
	MATCH_RESULT_WIN,
} from '@/shared/lib/stats';

import styles from './MatchResultOverlay.module.css';

export type MatchResultKind = 'win' | 'loss' | 'draw';

type MatchResultOverlayProps = {
	result: MatchResultKind;
	myRating: MatchMyRating | null | undefined;
	durationSeconds: number | null | undefined;
	/** Пока тянем ПТС/длительность после окончания — не показывать «без рейтинга». */
	metaLoading?: boolean;
	busy?: boolean;
	onRematch: () => void;
	onLobby: () => void;
	onMatches: () => void;
};

const TITLE: Record<MatchResultKind, string> = {
	win: 'Победа',
	loss: 'Поражение',
	draw: 'Ничья',
};

/**
 * Оверлей итога матча поверх поля боя (AC-1).
 */
export const MatchResultOverlay = ({
	result,
	myRating,
	durationSeconds,
	metaLoading = false,
	busy = false,
	onRematch,
	onLobby,
	onMatches,
}: MatchResultOverlayProps) => {
	const color = getMatchResultColor(result) ?? 'var(--app-text-muted)';
	return (
		<div className={styles.overlay} role="dialog" aria-label={`Итог матча: ${TITLE[result]}`}>
			<div className={styles.card}>
				<div className={styles.titleRow} style={{ color }}>
					{resultIcon(result)}
					<h2 className={styles.title}>{TITLE[result]}</h2>
				</div>
				<div className={styles.meta}>
					<Text size="md" c="var(--app-text)">
						{metaLoading ? 'Загрузка…' : formatRatingLine(myRating)}
					</Text>
					<Text size="sm" c="var(--app-text-muted)">
						Длительность:{' '}
						{metaLoading ? '…' : formatDuration(durationSeconds ?? null)}
					</Text>
				</div>
				<div className={styles.actions}>
					<Button
						className={styles.primaryBtn}
						radius={0}
						loading={busy}
						onClick={onRematch}
					>
						Реванш
					</Button>
					<Button
						className={styles.secondaryBtn}
						radius={0}
						variant="default"
						disabled={busy}
						onClick={onLobby}
					>
						В лобби
					</Button>
					<Button
						className={styles.secondaryBtn}
						radius={0}
						variant="default"
						disabled={busy}
						onClick={onMatches}
					>
						Мои матчи
					</Button>
				</div>
			</div>
		</div>
	);
};

const resultIcon = (result: MatchResultKind): ReactNode => {
	const size = 36;
	const stroke = 1.75;
	if (result === 'win') {
		return <Crown size={size} strokeWidth={stroke} color={MATCH_RESULT_WIN} aria-hidden />;
	}
	if (result === 'loss') {
		return <Skull size={size} strokeWidth={stroke} color={MATCH_RESULT_LOSS} aria-hidden />;
	}
	return <Equal size={size} strokeWidth={stroke} color="var(--app-text-muted)" aria-hidden />;
};

const formatRatingLine = (myRating: MatchMyRating | null | undefined): string => {
	if (!myRating) {
		return 'Матч без рейтинга';
	}
	const sign = myRating.ptsDelta > 0 ? '+' : '';
	return `ПТС ${myRating.ptsBefore} → ${myRating.ptsAfter}, ${sign}${myRating.ptsDelta}`;
};
