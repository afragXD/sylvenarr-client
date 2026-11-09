/**
 * Числовые превью способностей по формулам серверных handler’ов.
 * Урон — база до брони и попадания (не полный dealDamage).
 * Дополнять вместе с портами abilities на сервисе.
 */

import { pyRound } from '../lib/expectedValue';

export type PreviewCtx = {
	readonly lvl: number;
	readonly damage: number;
	readonly power: number;
	readonly health?: number;
	readonly maxHp?: number;
	/** 0..1; для лечения, зависящего от ОЗ цели (напр. Русалка). */
	readonly targetHpRatio?: number;
	readonly targetLvl?: number;
	/** Текущая мана цели — для числа в Сглазе. */
	readonly targetMana?: number;
	readonly luck?: number;
	/** Накопленная ярость Оркхана; в бою пока не в API — по умолчанию 0. */
	readonly cumRage?: number;
	readonly gold?: number;
	/** Живые враги в бою — для урона от их текущего ОЗ (Ангел «Где твои крылья»). */
	readonly enemies?: ReadonlyArray<{ readonly displayName: string; readonly health: number }>;
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
	const base = ctx.lvl * 2;
	const power = ctx.power;
	if (typeof ctx.targetHpRatio === 'number') {
		const ratio = Math.min(1, Math.max(0, ctx.targetHpRatio));
		const bonus = round(power * (1 + 0.5 * (1 - ratio)));
		return [heal(base + bonus)];
	}
	return [{ kind: 'healRange', min: base + power, max: base + round(power * 1.5) }];
}

function specterEvilEye(ctx: PreviewCtx): PreviewPart[] {
	const cap = 30 + 2 * ctx.lvl;
	const fire =
		typeof ctx.targetMana === 'number'
			? Math.min(Math.floor(ctx.targetMana / 2) * 8, cap)
			: cap;
	return [
		{ kind: 'duration', value: 1 + Math.floor(ctx.lvl / 4), label: 'р. «Метка»' },
		{ kind: 'text', value: `головокружение −${15 + Math.floor(ctx.lvl / 2)}` },
		{ kind: 'duration', value: 2 + Math.floor(ctx.lvl / 6), label: 'р. оковы' },
		{ kind: 'text', value: `${fire} Огонь при наложении` },
		{ kind: 'text', value: `оковы: X×${5 + Math.floor(ctx.lvl / 4)} Жизнь` },
	];
}

function angelWings(ctx: PreviewCtx): PreviewPart[] {
	const percent = 15 + ctx.lvl;
	const parts: PreviewPart[] = [{ kind: 'text', value: `${percent}% текущего ОЗ врага` }];
	for (const enemy of ctx.enemies ?? []) {
		parts.push({
			kind: 'text',
			value: `${enemy.displayName}: −${Math.max(1, round((enemy.health * percent) / 100))} ОЗ`,
		});
	}
	return parts;
}

/** Слоты и пассивки с числовым превью; нет записи → только текстовый mechanics. */
const PREVIEWS: Record<string, Partial<Record<AbilitySlotKey, PreviewFn>>> = {
	Knight: {
		passive: (ctx) => [
			{ kind: 'chance', value: 65 + ctx.lvl, label: 'укрепить ряд' },
			{ kind: 'armor', value: 1 + Math.floor(ctx.lvl / 5) },
		],
		1: (ctx) => [atk(ctx, 1.05)],
		2: (ctx) => [atk(ctx, 0.75)],
		3: (ctx) => [
			{ kind: 'gold', value: 100 + ctx.lvl * 2 },
			{ kind: 'strength', value: 15 + ctx.lvl },
			{ kind: 'duration', value: 1 + Math.floor(ctx.lvl / 5), label: 'р. «Сила»' },
			{ kind: 'duration', value: 2, label: 'р. «Благословение»' },
		],
		4: () => [{ kind: 'duration', value: 2, label: 'р. «Под охраной»' }],
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
		2: (ctx) => [{ kind: 'text', value: `облик · +1 ур. · мораль +${ctx.lvl + 3}` }],
	},
	Paladin: {
		1: (ctx) => [atk(ctx, 1.05), { kind: 'text', value: '×2 удара' }],
		2: (ctx) => [atk(ctx, 1.1)],
	},
	Abbess: {
		1: (ctx) => [atk(ctx, 1)],
		// CUT-2026-11-09 AC-4: randint(pyRound(p*0.6), pyRound(p*0.85)).
		2: (ctx) => {
			const lo = pyRound(ctx.power * 0.6);
			const hi = pyRound(ctx.power * 0.85);
			return [{ kind: 'healRange', min: Math.min(lo, hi), max: Math.max(lo, hi) }];
		},
	},
	Witch: {
		1: (ctx) => [atk(ctx, 1)],
		2: (ctx) => [atk(ctx, 1)],
		// DEATHSENTENCE: −(5+⌊(25+2L)/10⌋) брони · 2 р.; MARKED · 2+⌊L/6⌋ р.
		3: (ctx) => [
			{
				kind: 'text',
				value: `−${5 + Math.floor((25 + ctx.lvl * 2) / 10)} брони`,
			},
			{ kind: 'duration', value: 2, label: 'р. «Смертный приговор»' },
			{
				kind: 'duration',
				value: 2 + Math.floor(ctx.lvl / 6),
				label: 'р. «Метка»',
			},
		],
		5: () => [{ kind: 'text', value: 'бес на 2 р. · КД 4' }],
	},
	Inquisitor: {
		1: (ctx) => [atk(ctx, 1)],
		4: (ctx) => [atk(ctx, 1.25)],
		5: (ctx) => [atk(ctx, 0.9)],
	},
	Marauder: {
		1: (ctx) => [atk(ctx, 1.25)],
		3: (ctx) => [atk(ctx, 1.25)],
	},
	Werewolf: {
		1: (ctx) => [atk(ctx, 1.1)],
	},
	Herbalist: {
		// STRENGTH: round(damage × min(0.5+0.05L, 0.95)); длительность 1+⌊L/9⌋ (AC-4).
		1: (ctx) => [
			{
				kind: 'strength',
				value: Math.max(1, round(ctx.damage * Math.min(0.5 + 0.05 * ctx.lvl, 0.95))),
			},
			{ kind: 'duration', value: 1 + Math.floor(ctx.lvl / 9), label: 'р.' },
		],
		2: (ctx) => [{ kind: 'accuracy', value: 20 + ctx.lvl }],
		4: (ctx) => [
			{ kind: 'healRange', min: 15 + ctx.lvl * 2, max: 15 + ctx.lvl * 3 },
			{ kind: 'armor', value: 15 + ctx.lvl * 2 },
		],
		5: (ctx) => [atk(ctx, 1)],
	},
	Patriarch: {
		1: (ctx) => [atk(ctx, 1)],
		2: (ctx) => {
			const lo = pyRound(ctx.power * 0.5);
			const hi = pyRound(ctx.power * 0.6);
			const flat = ctx.lvl * 2 + (ctx.targetLvl ?? ctx.lvl) * 4;
			return [{ kind: 'healRange', min: flat + Math.min(lo, hi), max: flat + Math.max(lo, hi) }];
		},
		4: (ctx) => [{ kind: 'duration', value: 2 + Math.floor(ctx.lvl / 5), label: 'р. «Святилище»' }],
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
		// CUT AC-10: Чудесный доктор (бывший слот Инкуба).
		5: (ctx) => [{ kind: 'text', value: `+${50 + ctx.lvl * 5} мнимых ОЗ` }],
	},
	Demiurge: {
		1: (ctx) => [atk(ctx, 1)],
	},
	Pyro: {
		1: (ctx) => [atk(ctx, 1)],
	},
	Specter: {
		3: specterEvilEye,
		1: (ctx) => [
			atk(ctx, 1),
			{
				kind: 'text',
				value: `паралич −7 пп; при провале Разум ${5 + ctx.lvl * 2}–${9 + ctx.lvl * 2}`,
			},
		],
	},
	Detective: {
		1: (ctx) => [atk(ctx, 1.1)],
		2: (ctx) => [
			{ kind: 'chance', value: 50 + ctx.lvl * 2, label: 'яд ряду на 2 р.' },
		],
		4: (ctx) => [atk(ctx, 0.5)],
	},
	GhostWarrior: {
		1: (ctx) => [
			atk(ctx, 1),
			{ kind: 'chance', value: 68 + ctx.lvl, label: 'паралич (Смерть)' },
			{
				kind: 'text',
				value: `при провале стана: −(${5 + ctx.lvl}…${8 + ctx.lvl}) морали`,
			},
		],
		2: () => [
			{ kind: 'text', value: '+1 крит-банк себе' },
			{ kind: 'text', value: '+20% точности на 2 р.' },
		],
		3: () => [{ kind: 'text', value: 'скелет: ⌊ур. трупа союзника / 2⌋' }],
		4: () => [{ kind: 'text', value: 'только при ОЗ < 50%' }],
	},
	GoldGolem: {
		1: (ctx) => [atk(ctx, 0.9)],
	},
	BeerElemental: {
		passive: () => [
			{ kind: 'text', value: 'F≥1: −5·F морали; F=0: +4·M' },
			{ kind: 'text', value: 'ход: −10…80 золота' },
		],
		5: (ctx) => [atk(ctx, 1)],
	},
	EvilTree: {
		2: (ctx) => [atk(ctx, 1.2)],
		3: () => [{ kind: 'duration', value: 2, label: 'р. запрет лечения' }],
		4: (ctx) => [{ kind: 'duration', value: 3 + Math.floor(ctx.lvl / 4), label: 'р. урока' }],
		5: (ctx) => [
			{
				kind: 'text',
				value: `+${1 + Math.floor(ctx.lvl / 5)} ур. цели`,
			},
		],
	},
	Mermaid: {
		1: (ctx) => [...mermaidBreeze(ctx), { kind: 'text', value: '2 МР' }],
		2: (ctx) => [
			{ kind: 'chance', value: 38 + ctx.lvl, label: 'оглушение ряду' },
			{ kind: 'text', value: '2 МР · КД 3' },
		],
		3: () => [{ kind: 'text', value: 'без маны (заряды ульты)' }],
		4: (ctx) => [
			{ kind: 'accuracy', value: ctx.lvl + 3 },
			{ kind: 'text', value: '50% к оглушению · 2 р. · 1 МР · КД 3' },
		],
		5: (ctx) => [{ kind: 'text', value: `ряд +${15 + ctx.lvl} инициативы · 2 МР` }],
	},
	Dracolich: {
		1: (ctx) => [atk(ctx, 1)],
	},
	Antipaladin: {
		1: (ctx) => [atk(ctx, 1), { kind: 'text', value: `игнор ${25 + ctx.lvl}% брони` }],
		2: (ctx) => [atk(ctx, 1), { kind: 'text', value: `×${3 + Math.floor(ctx.lvl / 5)} удара` }],
		3: (ctx) => [
			{ kind: 'damage', value: Math.floor(ctx.damage / 3) + ctx.lvl * 2 },
			{ kind: 'chance', value: 50 + ctx.lvl * 2, label: 'кровотечение' },
			{ kind: 'text', value: 'через ≤1 ряд; не З→З' },
		],
		5: (ctx) => [atk(ctx, 1), { kind: 'text', value: '×1.2 по святым' }],
	},
	Angel: {
		passive: (ctx) => [{ kind: 'text', value: `+${15 + ctx.lvl} удачи бойцу` }],
		1: (ctx) => [heal(Math.floor(ctx.power / 2)), { kind: 'text', value: '×2 цели' }],
		3: angelWings,
		4: (ctx) => [{ kind: 'strength', value: 5 * ctx.lvl + 10 }],
		5: (ctx) => [atk(ctx, 1), { kind: 'chance', value: 70 + ctx.lvl * 2, label: 'рассеивание' }],
	},
	Titan: {
		passive: (ctx) => [{ kind: 'text', value: `+${2 + ctx.lvl} атаки воину` }],
		1: (ctx) => [atk(ctx, 1)],
		2: (ctx) => [
			{ kind: 'damage', value: round(ctx.power * 0.8 * 0.5) },
			{ kind: 'text', value: `−${Math.floor(ctx.lvl / 2) + 4} брони` },
		],
		3: (ctx) => [atk(ctx, 1), { kind: 'chance', value: 50 + ctx.lvl * 2, label: '−15% макс. ОЗ' }],
		4: (ctx) => [
			heal(Math.floor(ctx.power / 2) + ctx.lvl * 2),
			{ kind: 'armor', value: 15 + ctx.lvl * 2 },
		],
		5: (ctx) => [
			atk(ctx, 0.75),
			{ kind: 'text', value: 'Земля ×0,75' },
			{ kind: 'chance', value: 80 + ctx.lvl, label: 'слабость' },
			{ kind: 'text', value: '2 МР + 1 заряд' },
		],
	},
	Incub: {
		passive: (ctx) => [
			{
				kind: 'chance',
				value: 60 + ctx.lvl,
				label: `−${5 + Math.floor(ctx.lvl / 2)} морали (не на нежить)`,
			},
		],
		1: (ctx) => [
			{ kind: 'text', value: `${ctx.power} урона на ряд` },
			{ kind: 'chance', value: 70 + ctx.lvl, label: 'головокружение' },
		],
		// CUT AC-10: Огненный хлыст (магия огня), не мнимые ОЗ.
		2: (ctx) => [
			atk(ctx, 1),
			{
				kind: 'duration',
				value: 2 + Math.floor(ctx.lvl / 8),
				label: 'р. «Извержение»',
			},
			{ kind: 'text', value: '−5 пп Огню навсегда' },
		],
		3: (ctx) => [{ kind: 'strength', value: 20 + ctx.lvl * 2 }],
		4: (ctx) => [{ kind: 'text', value: `+${15 + ctx.lvl} удачи` }],
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

/** Контекст превью из боевого юнита; `enemies` — живые враги для превью от их ОЗ. */
export function previewCtxFromUnit(
	unit: {
		readonly lvl?: number;
		readonly damage: number;
		readonly power: number;
		readonly health: number;
		readonly maxHp: number;
		readonly luck?: number;
		readonly gold?: number;
	},
	enemies?: PreviewCtx['enemies'],
): PreviewCtx {
	return {
		lvl: typeof unit.lvl === 'number' ? unit.lvl : 1,
		damage: unit.damage,
		power: unit.power,
		health: unit.health,
		maxHp: unit.maxHp,
		luck: unit.luck,
		gold: unit.gold ?? 0,
		cumRage: 0,
		enemies,
	};
}
