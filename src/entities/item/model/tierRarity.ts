export type TierRarity = {
	readonly name: string;
	/** Нет цвета у обычных: имя остаётся цветом текста. */
	readonly color?: string;
};

const UNCOMMON = '#7FA86A';
const RARE = '#6AA4C8';
const EPIC = '#A98BD4';
const LEGENDARY = '#E08A3C';

/**
 * Редкость по тиру предмета. Ступени совпадают с кейсами: 3–4, 5–6, 7–8 и легендарный 9.
 */
export function tierRarity(tier: number): TierRarity {
	const n = Math.round(tier);
	if (n >= 9) {
		return { name: 'Легендарный', color: LEGENDARY };
	}
	if (n >= 7) {
		return { name: 'Эпический', color: EPIC };
	}
	if (n >= 5) {
		return { name: 'Редкий', color: RARE };
	}
	if (n >= 3) {
		return { name: 'Необычный', color: UNCOMMON };
	}
	return { name: 'Обычный' };
}

export function tierRarityTitle(tier: number): string {
	const rarity = tierRarity(tier);
	return `${rarity.name}, тир ${Math.max(1, Math.round(tier))}`;
}
