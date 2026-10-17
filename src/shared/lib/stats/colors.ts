/**
 * Цвета результата матча и винрейта для Mantine prop `c`.
 */

export const getMatchResultColor = (result: 'win' | 'loss' | 'draw'): string | undefined => {
	if (result === 'win') {
		return 'brand';
	}
	if (result === 'loss') {
		return 'accent';
	}
	return 'var(--app-text-muted)';
};

export const getWinrateColor = (winrate: number): string | undefined => {
	if (winrate >= 60) {
		return 'brand';
	}
	if (winrate >= 50) {
		return undefined;
	}
	if (winrate >= 40) {
		return 'var(--app-text-muted)';
	}
	return 'accent';
};
