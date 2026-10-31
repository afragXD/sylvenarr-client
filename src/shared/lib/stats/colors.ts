/**
 * Цвета результата матча и винрейта.
 * Победа — медь #E9C08F; поражение — враг #D9574A (AC-1).
 * Винрейт — плавный градиент accent → тёплый mid → moss (0–100%).
 */

type Rgb = readonly [number, number, number];

/** Победа (медь / --copper) */
export const MATCH_RESULT_WIN = '#E9C08F';
/** Поражение (враг / --enemy), ≥4,5:1 на #17110C и #1A130E */
export const MATCH_RESULT_LOSS = '#D9574A';
/** Фон оверлея итога */
export const MATCH_RESULT_OVERLAY_BG = '#17110C';

/** Accent 6 — поражение в винрейте */
const WINRATE_LOW: Rgb = [196, 92, 72];
/** Тёплый камень между ember и moss (избегаем грязного RGB red↔green) */
const WINRATE_MID: Rgb = [168, 140, 72];
/** Moss 6 — победа */
const WINRATE_HIGH: Rgb = [94, 127, 74];

const lerp = (a: number, b: number, t: number): number => Math.round(a + (b - a) * t);

const lerpRgb = (from: Rgb, to: Rgb, t: number): string => {
	const clamped = Math.min(1, Math.max(0, t));
	return `rgb(${lerp(from[0], to[0], clamped)} ${lerp(from[1], to[1], clamped)} ${lerp(from[2], to[2], clamped)})`;
};

export const getMatchResultColor = (result: 'win' | 'loss' | 'draw'): string | undefined => {
	if (result === 'win') {
		return MATCH_RESULT_WIN;
	}
	if (result === 'loss') {
		return MATCH_RESULT_LOSS;
	}
	return 'var(--app-text-muted)';
};

/** Плавный цвет винрейта: 0% → accent, 50% → mid, 100% → moss. */
export const getWinrateColor = (winrate: number): string => {
	const t = Math.min(100, Math.max(0, winrate)) / 100;
	if (t <= 0.5) {
		return lerpRgb(WINRATE_LOW, WINRATE_MID, t / 0.5);
	}
	return lerpRgb(WINRATE_MID, WINRATE_HIGH, (t - 0.5) / 0.5);
};

/** Нулевой уровень ПТС (Heroes III / StickyFingaz). */
export const START_PTS = 1500;

/**
 * Цвет ПТС относительно нулевого уровня 1500:
 * ниже — accent, на уровне — muted, выше — moss.
 */
export const getPtsColor = (pts: number): string => {
	if (pts > START_PTS) {
		return 'moss';
	}
	if (pts < START_PTS) {
		return 'accent';
	}
	return 'var(--app-text-muted)';
};
