import type { RatingRow } from '@/entities/rating';
import { START_PTS } from '@/shared/lib/stats';

/** Одна линия разделителя 1500 (AC-4). */
export const THRESHOLD_LINE_COLOR = '#CBB48C';
export const THRESHOLD_LINE_WIDTH = '1px';

/**
 * Индекс вставки разделителя 1500: после последнего ≥1500.
 * Все ≥1500 → внизу (length); все <1500 → вверху (0).
 */
export const thresholdInsertIndex = (items: RatingRow[]): number => {
	const firstBelow = items.findIndex((row) => row.pts < START_PTS);
	if (firstBelow === -1) {
		return items.length;
	}
	if (firstBelow === 0) {
		return 0;
	}
	return firstBelow;
};

/** Показ ссылки «Показать меня» (AC-5): своя строка есть и вне видимой области. */
export const shouldShowShowMeLink = (opts: {
	readonly myRank: number;
	readonly rowVisible: boolean;
}): boolean => opts.myRank > 0 && !opts.rowVisible;

type ObserveCandidate = {
	getClientRects: () => ArrayLike<{ width: number; height: number }>;
};

/** Видимый DOM-узел для IntersectionObserver (не display:none / нулевой box). */
export const pickVisibleObserveTarget = <T extends ObserveCandidate>(
	candidates: Array<T | null | undefined>,
): T | null => {
	for (const node of candidates) {
		if (!node || typeof node.getClientRects !== 'function') {
			continue;
		}
		const style =
			typeof getComputedStyle === 'function'
				? getComputedStyle(node as unknown as Element)
				: null;
		if (style && (style.display === 'none' || style.visibility === 'hidden')) {
			continue;
		}
		if (node.getClientRects().length === 0) {
			continue;
		}
		return node;
	}
	return null;
};
