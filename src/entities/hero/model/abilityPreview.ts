/**
 * Числовые превью способностей по формулам серверных handler’ов.
 * Урон — база до брони и попадания (не полный dealDamage).
 * Дополнять вместе с портами abilities на сервисе.
 */

export type PreviewCtx = {
	readonly lvl: number;
	readonly damage: number;
	readonly power: number;
	readonly health?: number;
	readonly maxHp?: number;
	/** 0..1; для лечения, зависящего от ОЗ цели (напр. Русалка). */
	readonly targetHpRatio?: number;
	readonly luck?: number;
	/** Накопленная ярость Оркхана; в бою пока не в API — по умолчанию 0. */
	readonly cumRage?: number;
	readonly gold?: number;
};

export type AbilitySlotKey = 1 | 2 | 3 | 4 | 5 | 'passive';

export type PreviewPart =
	| { kind: 'damage'; value: number }
	| { kind: 'heal'; value: number }
	| { kind: 'healRange'; min: number; max: number }
	| { kind: 'accuracy'; value: number }
	| { kind: 'armor'; value: number }
	| { kind: 'luck'; value: number; note?: string }
	| { kind: 'gold'; value: number }
	| { kind: 'chance'; value: number; label?: string }
	| { kind: 'duration'; value: number; label: string }
	| { kind: 'strength'; value: number }
	| { kind: 'text'; value: string };

type PreviewFn = (ctx: PreviewCtx) => PreviewPart[];

const round = (n: number): number => Math.round(n);

/** Урон слота в превью: max(атака, сила магии) — только отображение. */
const atk = (ctx: PreviewCtx, mult: number): PreviewPart => ({
	kind: 'damage',
	value: Math.max(0, round(Math.max(ctx.damage, ctx.power) * mult)),
});

const heal = (value: number): PreviewPart => ({
	kind: 'heal',
	value: Math.max(0, round(value)),
});

function orcRage(ctx: PreviewCtx): number {
	const maxHp = ctx.maxHp && ctx.maxHp > 0 ? ctx.maxHp : 1;
	const health = ctx.health ?? maxHp;
	const cum = ctx.cumRage ?? 0;
	return round((2 - health / maxHp + cum) * 100) / 100;
}

function mermaidBreeze(ctx: PreviewCtx): PreviewPart[] {
	const base = ctx.lvl * 5;
	const acc: PreviewPart = { kind: 'accuracy', value: ctx.lvl * 2 + 2 };
	if (typeof ctx.targetHpRatio === 'number') {
		const ratio = Math.min(1, Math.max(0, ctx.targetHpRatio));
		const bonus = round(20 * (2 - ratio));
		return [heal(base + bonus), acc];
	}
	return [{ kind: 'healRange', min: base + 20, max: base + 40 }, acc];
}

/** Слоты и пассивки с числовым превью; нет записи → только текстовый mechanics. */
const PREVIEWS: Record<string, Partial<Record<AbilitySlotKey, PreviewFn>>> = {
	Knight: {
		passive: (ctx) => [{ kind: 'armor', value: ctx.lvl + 1 }],
		1: (ctx) => [atk(ctx, 1.05)],
		2: (ctx) => [atk(ctx, 0.75)],
		3: (ctx) => [
			{ kind: 'gold', value: 100 + ctx.lvl * 2 },
			{ kind: 'strength', value: 20 + ctx.lvl * 2 },
		],
		4: () => [{ kind: 'armor', value: 3 }, { kind: 'duration', value: 2, label: 'р.' }],
	},
	OrcKing: {
		passive: (ctx) => [
			{
				kind: 'luck',
				value: Math.max(0, ctx.lvl - 1),
				note: 'если удача < −10',
			},
		],
		1: (ctx) => [atk(ctx, 1.1 * orcRage(ctx))],
		3: (ctx) => [atk(ctx, 0.75)],
		4: (ctx) => [atk(ctx, 0.5), { kind: 'text', value: '×2 удара' }],
		5: (ctx) => [
			{ kind: 'text', value: `«Радость» ${15 + ctx.lvl * 2}` },
			{
				kind: 'text',
				value: `+${2 * ctx.lvl}…${3 * ctx.lvl + 7} брони`,
			},
		],
	},
	Archlich: {
		1: (ctx) => [atk(ctx, 1.1)],
	},
	DemonLord: {
		1: (ctx) => [atk(ctx, 1.15)],
		2: (ctx) => [atk(ctx, 2)],
		3: (ctx) => [atk(ctx, 1)],
	},
	Assassin: {
		1: (ctx) => [atk(ctx, 1.15)],
		2: (ctx) => [{ kind: 'text', value: `«Радость» ${ctx.lvl + 3}` }],
	},
	Paladin: {
		1: (ctx) => [atk(ctx, 1.05), { kind: 'text', value: '×2 удара' }],
		2: (ctx) => [atk(ctx, 1.1)],
	},
	Abbess: {
		1: (ctx) => [atk(ctx, 1)],
	},
	Witch: {
		1: (ctx) => [atk(ctx, 1)],
		2: (ctx) => [atk(ctx, 1)],
		3: (ctx) => [atk(ctx, 1)],
	},
	Inquisitor: {
		1: (ctx) => [atk(ctx, 1)],
		3: (ctx) => [atk(ctx, 1.25)],
		4: (ctx) => [atk(ctx, 0.9)],
	},
	Marauder: {
		1: (ctx) => [atk(ctx, 1.25)],
		3: (ctx) => [atk(ctx, 1.25)],
	},
	Werewolf: {
		1: (ctx) => [atk(ctx, 1.1)],
	},
	Herbalist: {
		// STRENGTH от урона цели; без выбранной цели — оценка от своего урона.
		1: (ctx) => [
			{
				kind: 'strength',
				value: Math.max(1, round(ctx.damage * (0.5 + 0.05 * ctx.lvl))),
			},
			{ kind: 'duration', value: 1 + Math.floor(ctx.lvl / 6), label: 'р.' },
		],
		2: (ctx) => [{ kind: 'accuracy', value: 20 + ctx.lvl }],
		4: (ctx) => [heal(5 + ctx.lvl)],
		5: (ctx) => [atk(ctx, 1)],
	},
	Patriarch: {
		1: (ctx) => [atk(ctx, 1)],
		2: (ctx) => [heal(ctx.lvl * 7 + Math.floor(ctx.power / 3))],
		4: (ctx) => [
			{ kind: 'duration', value: 2 + Math.floor(ctx.lvl / 5), label: 'р. «Святилище»' },
		],
	},
	Oracle: {
		1: (ctx) => [
			{
				kind: 'healRange',
				min: 35 + ctx.lvl,
				max: 50 + ctx.lvl * 4,
			},
			{ kind: 'text', value: '+15% max ОЗ' },
		],
	},
	Demiurge: {
		1: (ctx) => [atk(ctx, 1)],
	},
	Pyro: {
		1: (ctx) => [atk(ctx, 1)],
	},
	Specter: {
		1: (ctx) => [atk(ctx, 1)],
	},
	Detective: {
		1: (ctx) => [atk(ctx, 1.1)],
		2: (ctx) => [atk(ctx, 0.5)],
	},
	GhostWarrior: {
		1: (ctx) => [atk(ctx, 1)],
	},
	GoldGolem: {
		1: (ctx) => [atk(ctx, 0.9)],
	},
	BeerElemental: {
		1: (ctx) => [atk(ctx, 1)],
	},
	EvilTree: {
		2: (ctx) => [atk(ctx, 1.2)],
		3: (ctx) => [
			{ kind: 'duration', value: 2 + Math.floor(ctx.lvl / 4), label: 'р. запрет лечения' },
		],
		4: (ctx) => [
			{ kind: 'duration', value: 3 + Math.floor(ctx.lvl / 4), label: 'р. урока' },
		],
		5: () => [{ kind: 'text', value: '+3 уровня цели' }],
	},
	Mermaid: {
		1: mermaidBreeze,
		2: (ctx) => [{ kind: 'chance', value: 38 + ctx.lvl, label: 'оглушение ряду' }],
		4: (ctx) => [
			{ kind: 'duration', value: 2 + Math.floor(ctx.lvl / 6), label: 'р. оковы' },
		],
	},
	Dracolich: {
		1: (ctx) => [atk(ctx, 1)],
	},
};

/**
 * Части превью для слота/пассивки; null если нет числовой формулы.
 */
export function getAbilityPreview(
	heroCode: string,
	slot: AbilitySlotKey,
	ctx: PreviewCtx,
): PreviewPart[] | null {
	const fn = PREVIEWS[heroCode]?.[slot];
	if (!fn) {
		return null;
	}
	const parts = fn(ctx);
	return parts.length > 0 ? parts : null;
}

function formatPart(part: PreviewPart): string {
	switch (part.kind) {
		case 'damage':
			return `≈${part.value} урона до брони и попадания`;
		case 'heal':
			return `+${part.value} ОЗ`;
		case 'healRange':
			return `+${part.min}…${part.max} ОЗ`;
		case 'accuracy':
			return `+${part.value} точности`;
		case 'armor':
			return `+${part.value} брони`;
		case 'luck':
			return part.note ? `−${part.value} удачи (${part.note})` : `−${part.value} удачи`;
		case 'gold':
			return `${part.value} золота`;
		case 'chance':
			return part.label ? `${part.value}% ${part.label}` : `${part.value}%`;
		case 'duration':
			return `${part.value} ${part.label}`;
		case 'strength':
			return `+${part.value} к урону («Сила»)`;
		case 'text':
			return part.value;
		default: {
			const _exhaustive: never = part;
			return _exhaustive;
		}
	}
}

/**
 * Собирает строку превью; `atLevelLabel` — напр. «на 1 ур.» для реестра.
 */
export function formatAbilityPreview(
	parts: PreviewPart[] | null,
	options?: { readonly atLevelLabel?: string },
): string | null {
	if (!parts || parts.length === 0) {
		return null;
	}
	const body = parts.map(formatPart).join(' · ');
	return options?.atLevelLabel ? `${body} (${options.atLevelLabel})` : body;
}

/** Контекст превью из каталожного героя (реестр — всегда ур. 1). */
export function previewCtxFromHero(hero: {
	readonly damage: number;
	readonly power: number;
	readonly health: number;
	readonly luck: number;
	readonly gold: number;
	readonly lvl?: number;
}): PreviewCtx {
	const lvl = hero.lvl ?? 1;
	return {
		lvl,
		damage: hero.damage,
		power: hero.power,
		health: hero.health,
		maxHp: hero.health,
		luck: hero.luck,
		gold: hero.gold,
		cumRage: 0,
	};
}

/** Контекст превью из боевого юнита. */
export function previewCtxFromUnit(unit: {
	readonly lvl?: number;
	readonly damage: number;
	readonly power: number;
	readonly health: number;
	readonly maxHp: number;
	readonly luck?: number;
	readonly gold?: number;
}): PreviewCtx {
	return {
		lvl: typeof unit.lvl === 'number' ? unit.lvl : 1,
		damage: unit.damage,
		power: unit.power,
		health: unit.health,
		maxHp: unit.maxHp,
		luck: unit.luck,
		gold: unit.gold,
		cumRage: 0,
	};
}
