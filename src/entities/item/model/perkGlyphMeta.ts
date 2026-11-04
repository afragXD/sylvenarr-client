/** Буквы глифа перка предметов — те же, что у ItemGlyph по категории. */
const ITEM_CATEGORY_MARK: Record<number, string> = {
	1: 'Т',
	2: 'Х',
	3: 'Сф',
	4: 'Св',
	5: 'Р',
	6: 'А',
	7: 'Рс',
	8: 'П',
	9: 'В',
};

const ITEM_PERK_CATEGORY: Record<string, number> = {
	TALISMANS: 1,
	TECHNO: 2,
	ORBS: 3,
	SCROLLS: 4,
	RELICS: 5,
	ARTIFACTS: 6,
	MISC: 7,
	STAFFS: 8,
	MILITARY: 9,
};

/** Короткие метки прочих перков. */
const OTHER_PERK_MARK: Record<string, string> = {
	LOWHP_EXTRATURN: 'Хр',
	GRAND_MERCHANT: 'Тг',
	BONUS_MOVEMENT: 'Кр',
	CORPSE_BONUS: 'Ус',
	DOUBLE_USING_INVENTORY: 'Уп',
	SUMMON_LEVEL_UP: 'Бл',
	DARK_CREATURES_SLAYER: 'Чс',
	NONHUMAN_SLAYER: 'Нл',
	LUDOMANIA: 'Лд',
	SIGMALIKE: 'Σ',
	LUCKYBASTARD: 'Вз',
	MANDATEOFHEAVEN: 'Нм',
	ARMORPENETRATOR: 'Пн',
	SHINEOFTHISUNGLASSES: 'Оч',
	LONGWEAPON: 'Хв',
	MORESUMMONS: 'Пр',
};

export type PerkGlyphMeta = {
	readonly mark: string;
	readonly kind: 'item' | 'other';
	readonly category: number | null;
};

/** Мета глифа по id перка (для боя, кодекса, выбора). */
export function perkGlyphMeta(perkId: string): PerkGlyphMeta {
	const category = ITEM_PERK_CATEGORY[perkId];
	if (category != null) {
		return {
			mark: ITEM_CATEGORY_MARK[category] ?? String(category),
			kind: 'item',
			category,
		};
	}
	return {
		mark: OTHER_PERK_MARK[perkId] ?? '?',
		kind: 'other',
		category: null,
	};
}
