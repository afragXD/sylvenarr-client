/** Стартовые перки класса при включённой ярмарке (зеркало service class-setup). */
const BASE = ['MISC'] as const;

const CLASS_STARTING_PERKS: Record<string, readonly string[]> = {
	Pyro: [...BASE, 'TECHNO'],
	Specter: [...BASE, 'BONUS_MOVEMENT'],
	Witch: ['TECHNO', 'TALISMANS'],
	Oracle: [...BASE, 'SCROLLS'],
	OrcKing: [...BASE, 'MILITARY'],
	Knight: [...BASE, 'LOWHP_EXTRATURN'],
	Archlich: [...BASE, 'ORBS'],
	Marauder: [...BASE, 'DOUBLE_USING_INVENTORY'],
	DemonLord: [...BASE, 'TALISMANS'],
	Abbess: [...BASE, 'RELICS'],
	Titan: [...BASE, 'GRAND_MERCHANT'],
	Detective: [...BASE],
};

/** Стартовые перки героя в матче с ярмаркой; иначе базовый MISC. */
export function classStartingPerks(heroClassCode: string): readonly string[] {
	return CLASS_STARTING_PERKS[heroClassCode] ?? [...BASE];
}
