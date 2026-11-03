/** Перк категории предмета → id / русское имя (зеркало service). */
export const ITEM_PERK_BY_CATEGORY: Record<number, { id: string; name: string }> = {
	1: { id: 'TALISMANS', name: 'Талисманы' },
	2: { id: 'TECHNO', name: 'Технологии' },
	3: { id: 'ORBS', name: 'Сферы' },
	4: { id: 'SCROLLS', name: 'Свитки' },
	5: { id: 'RELICS', name: 'Реликвии' },
	6: { id: 'ARTIFACTS', name: 'Артефакты' },
	7: { id: 'MISC', name: 'Расходники' },
	8: { id: 'STAFFS', name: 'Посохи' },
	9: { id: 'MILITARY', name: 'Военное дело' },
};

export function requiredPerkForCategory(category: number): { id: string; name: string } | null {
	return ITEM_PERK_BY_CATEGORY[category] ?? null;
}

export function unitHasItemPerk(perks: readonly string[] | undefined, category: number): boolean {
	const need = requiredPerkForCategory(category);
	if (!need) {
		return true;
	}
	return (perks ?? []).includes(need.id);
}
