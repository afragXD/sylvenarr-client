/**
 * Базовые сопротивления и варды классов — зеркало серверного defaultResists.ts
 * (тот же паттерн, что heroAbilities.ts: держать в синхронизации вручную).
 */
export type BaseResistEntry = {
	readonly source: string;
	readonly label: string;
	/** % снижения урона; отрицательный — уязвимость. */
	readonly value: number;
	readonly wardCharges: number | null;
	readonly immune: boolean;
};

const entry = (
	source: string,
	label: string,
	spec: { value?: number; ward?: number; immune?: boolean } = {},
): BaseResistEntry => ({
	source,
	label,
	value: spec.value ?? 0,
	wardCharges: spec.ward && spec.ward > 0 ? spec.ward : null,
	immune: Boolean(spec.immune),
});

const BASE_RESISTS: Record<string, BaseResistEntry[]> = {
	Pyro: [entry('FIRE', 'Огонь', { ward: 1 })],
	Oracle: [entry('FIRE', 'Огонь', { ward: 1 })],
	Witch: [
		entry('FINALSTRIKE', 'Смертельный удар', { value: 25, ward: 1 }),
		entry('DEATH', 'Смерть', { value: 25, ward: 1 }),
		entry('FIRE', 'Огонь', { value: -20 }),
		entry('WATER', 'Вода', { value: -20 }),
	],
	Paladin: [
		entry('HOLY', 'Сакральный', { value: 20 }),
		entry('WATER', 'Вода', { value: 25, ward: 1 }),
		entry('DESTROYARMOR', 'Разрушение брони', { ward: 1 }),
	],
	Knight: [entry('FINALSTRIKE', 'Смертельный удар', { value: 25 })],
	Archlich: [
		entry('FIRE', 'Огонь', { value: -20 }),
		entry('DEATH', 'Смерть', { value: 75, ward: 1 }),
		entry('HOLY', 'Сакральный', { value: -20 }),
	],
	Marauder: [
		entry('POLYMORPH', 'Превращение', { value: 25, ward: 1 }),
		entry('HOLY', 'Сакральный', { value: 40 }),
	],
	Werewolf: [
		entry('POLYMORPH', 'Превращение', { value: 25, ward: 1 }),
		entry('HOLY', 'Сакральный', { value: 40 }),
	],
	GoldGolem: [
		entry('FIRE', 'Огонь', { value: 25, ward: 1 }),
		entry('AIR', 'Воздух', { value: 25, ward: 1 }),
		entry('DEATH', 'Смерть', { value: 25 }),
	],
	Herbalist: [entry('STUN', 'Оглушение', { ward: 1 })],
	Inquisitor: [
		entry('MIND', 'Разум', { value: 60, ward: 1 }),
		entry('FIRE', 'Огонь', { value: 20 }),
		entry('LOWERINGLEVEL', 'Понижение уровня', { ward: 1 }),
	],
	Dracolich: [
		entry('MOVEMENT', 'Перемещение', { ward: 1 }),
		entry('DEATH', 'Смерть', { value: 80, ward: 1 }),
		entry('LOWERINGLEVEL', 'Понижение уровня', { immune: true }),
		entry('POLYMORPH', 'Превращение', { ward: 1 }),
	],
	GhostWarrior: [
		entry('DEATH', 'Смерть', { value: 85 }),
		entry('HOLY', 'Сакральный', { value: -35 }),
		entry('WEAPON', 'Оружие', { value: 20 }),
	],
	Demiurge: [
		entry('IMITATION', 'Копирование', { immune: true }),
		entry('AIR', 'Воздух', { value: 20 }),
		entry('POLYMORPH', 'Превращение', { ward: 1 }),
	],
	DemonLord: [
		entry('MOVEMENT', 'Перемещение', { immune: true }),
		entry('FIRE', 'Огонь', { value: 50, ward: 1 }),
		entry('MIND', 'Разум', { ward: 1 }),
	],
	Abbess: [
		entry('IMITATION', 'Копирование', { ward: 1 }),
		entry('AIR', 'Воздух', { value: 20, ward: 1 }),
		entry('EARTH', 'Земля', { value: 15 }),
	],
	Assassin: [
		entry('MIND', 'Разум', { value: -25 }),
		entry('DEATH', 'Смерть', { value: 35, ward: 1 }),
	],
	Zombie: [
		entry('FIRE', 'Огонь', { value: -25 }),
		entry('DEATH', 'Смерть', { value: 50 }),
		entry('HOLY', 'Сакральный', { value: -40 }),
	],
	SkeletonChampion: [
		entry('AIR', 'Воздух', { value: -25 }),
		entry('DEATH', 'Смерть', { value: 65 }),
		entry('ARROWS', 'Снаряды', { value: 50, ward: 1 }),
		entry('HOLY', 'Сакральный', { value: -30 }),
	],
	Ectoplasm: [entry('WEAPON', 'Оружие', { ward: 1 })],
};

/** Базовые резисты/варды класса (пусто, если не заданы). */
export function getHeroBaseResists(code: string): BaseResistEntry[] {
	return BASE_RESISTS[code] ?? [];
}

/** Краткий формат значения: «25% · Щит×1», «Щит×2», «Иммунитет», «−20%». */
export function formatBaseResistValue(resist: BaseResistEntry): string {
	if (resist.immune) {
		return 'Иммунитет';
	}
	const percent =
		resist.value > 0 ? `${resist.value}%` : resist.value < 0 ? `−${Math.abs(resist.value)}%` : '';
	if (resist.wardCharges != null && resist.wardCharges > 0) {
		return percent ? `${percent} · Щит×${resist.wardCharges}` : `Щит×${resist.wardCharges}`;
	}
	return percent || '0%';
}

/** Одна строка для краткой карточки: «Огонь Щит×1 · Смерть 25%»; null если нет. */
export function formatBaseResistsLine(code: string): string | null {
	const resists = getHeroBaseResists(code);
	if (resists.length === 0) {
		return null;
	}
	return resists.map((resist) => `${resist.label} ${formatBaseResistValue(resist)}`).join(' · ');
}
