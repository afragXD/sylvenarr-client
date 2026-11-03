/** Имена категорий предметов (зеркало ITEM_PERK_BY_CATEGORY). */
export const ITEM_CATEGORY_LABEL: Record<number, string> = {
	1: 'Талисманы',
	2: 'Технологии',
	3: 'Сферы',
	4: 'Свитки',
	5: 'Реликвии',
	6: 'Артефакты',
	7: 'Расходники',
	8: 'Посохи',
	9: 'Военное дело',
};

export const ITEM_TARGET_LABEL: Record<string, string> = {
	self: 'На себя',
	ally: 'Союзник',
	allySummon: 'Союзный призыв',
	enemy: 'Враг',
	enemySummon: 'Вражеский призыв',
	sellOnly: 'Только продажа',
};

export function categoryLabel(category: number): string {
	return ITEM_CATEGORY_LABEL[category] ?? `Категория ${category}`;
}
