/** Русские имена перков по id (зеркало service PERK_CATALOG). */
export const PERK_NAME: Record<string, string> = {
	TALISMANS: 'Талисманы',
	TECHNO: 'Технологии',
	ORBS: 'Сферы',
	SCROLLS: 'Свитки',
	RELICS: 'Реликвии',
	ARTIFACTS: 'Артефакты',
	MISC: 'Расходники',
	STAFFS: 'Посохи',
	MILITARY: 'Военное дело',
	LOWHP_EXTRATURN: 'Предсмертный хрип',
	GRAND_MERCHANT: 'Суперкоммерсант',
	BONUS_MOVEMENT: 'Крылья',
	CORPSE_BONUS: 'Упивающийся смертью',
	DOUBLE_USING_INVENTORY: 'Упаковка',
	SUMMON_LEVEL_UP: 'Благословение демиурга',
	DARK_CREATURES_SLAYER: 'Борец за чистоту',
	NONHUMAN_SLAYER: 'Водитель-расист',
	LUDOMANIA: 'Лудоман',
	SIGMALIKE: 'Сигма',
	LUCKYBASTARD: 'Везунчик',
	MANDATEOFHEAVEN: 'Небесный мандат',
	ARMORPENETRATOR: 'Пенетратор латников',
	SHINEOFTHISUNGLASSES: 'Сверкающие очки',
	LONGWEAPON: 'Умелый хват',
	MORESUMMONS: 'Многодетный отец',
};

export function perkName(id: string): string {
	return PERK_NAME[id] ?? 'Неизвестный перк';
}
