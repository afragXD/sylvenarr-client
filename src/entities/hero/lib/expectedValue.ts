/**
 * CUT AC-14: матожидание randint(lo, hi) включительно, округлённое вверх.
 * Пример: randint(5, 8) → 6.5 → 7.
 */
export function expectedRandInt(lo: number, hi: number): number {
	const a = Math.min(lo, hi);
	const b = Math.max(lo, hi);
	return Math.ceil((a + b) / 2);
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
