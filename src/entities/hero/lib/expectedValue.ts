/**
 * Неокруглённое матожидание randint(lo, hi) включительно.
 * Пример: randint(1, 2) → 1.5; randint(5, 8) → 6.5.
 */
export function expectedMean(lo: number, hi: number): number {
	const a = Math.min(lo, hi);
	const b = Math.max(lo, hi);
	return (a + b) / 2;
}

/**
 * Матожидание одного броска, округлённое вверх (для одиночных превью способностей).
 * Пример: randint(5, 8) → 6.5 → 7.
 * Для слайдера уровня используйте expectedMean и один Math.ceil в конце.
 */
export function expectedRandInt(lo: number, hi: number): number {
	return Math.ceil(expectedMean(lo, hi));
}

/**
 * Python 3 round: half to even (CUT AC-4 / Аббатиса).
 * round(20.5) = 20, round(21.5) = 22.
 */
export function pyRound(n: number): number {
	const floor = Math.floor(n);
	const frac = n - floor;
	if (frac < 0.5) {
		return floor;
	}
	if (frac > 0.5) {
		return floor + 1;
	}
	return floor % 2 === 0 ? floor : floor + 1;
}
