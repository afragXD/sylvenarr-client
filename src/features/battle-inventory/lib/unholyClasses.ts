/** Нежить по коду класса (зеркало service combat/races). */
const UNDEAD_CODES: ReadonlySet<string> = new Set([
	'Archlich',
	'GhostWarrior',
	'Dracolich',
	'Zombie',
	'SkeletonChampion',
	'Specter',
]);

/** Демоны по коду класса (зеркало service combat/races). */
const DEMON_CODES: ReadonlySet<string> = new Set(['DemonLord', 'Witch', 'Incub']);

export function isUnholyClass(code: string): boolean {
	return UNDEAD_CODES.has(code) || DEMON_CODES.has(code);
}
