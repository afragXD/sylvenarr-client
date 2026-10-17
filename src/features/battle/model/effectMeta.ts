import type { LucideIcon } from 'lucide-react';
import {
	Droplet,
	Droplets,
	Flame,
	Ghost,
	HeartPulse,
	HelpCircle,
	Link,
	Orbit,
	Shield,
	Smile,
	Sparkles,
	Sword,
} from 'lucide-react';

export type EffectId =
	| 'GUARDED'
	| 'STRENGTH'
	| 'BLESSED'
	| 'POISON'
	| 'BURNING'
	| 'BLEEDING'
	| 'FATMAN'
	| 'HAPPY'
	| 'CHAINED'
	| 'FEAR'
	| 'VAMPWEAPON';

export type EffectKind = 'buff' | 'debuff';

export type EffectMeta = {
	id: EffectId;
	label: string;
	description: string;
	/** Формула для кодекса (видимый текст). */
	mechanics: string;
	/** Тултип: «Например при уровне L: …». */
	exampleAtL: string;
	Icon: LucideIcon;
	kind: EffectKind;
};

/** Сколько иконок эффектов показывать на юните до бейджа +K. */
export const MAX_VISIBLE_EFFECTS = 4;

/** Условный уровень L в формулах кодекса (= PILOT_LVL на сервисе). */
export const CODEX_L = 5;

const exampleAt = (value: string): string => `Например при уровне ${CODEX_L}: ${value}`;

const BUFF_ORDER: EffectId[] = ['GUARDED', 'STRENGTH', 'BLESSED', 'HAPPY', 'VAMPWEAPON'];

const DEBUFF_ORDER: EffectId[] = ['POISON', 'BURNING', 'BLEEDING', 'FATMAN', 'CHAINED', 'FEAR'];

const CATALOG: Record<EffectId, EffectMeta> = {
	GUARDED: {
		id: 'GUARDED',
		label: 'Под охраной',
		description: 'Союзник прикрывает цель: повышенная защита на несколько раундов.',
		mechanics: '+3 брони · 2 р.',
		exampleAtL: exampleAt('+3 брони · 2 р.'),
		Icon: Shield,
		kind: 'buff',
	},
	STRENGTH: {
		id: 'STRENGTH',
		label: 'Сила',
		description: 'Увеличивает наносимый урон.',
		mechanics: '+(20 + 2L) урона · (1 + ⌊L/5⌋) р.',
		exampleAtL: exampleAt('+30 урона · 2 р.'),
		Icon: Sword,
		kind: 'buff',
	},
	BLESSED: {
		id: 'BLESSED',
		label: 'Благословение',
		description: 'Усиливает получаемое лечение.',
		mechanics: 'лечение ×1.5 · (1 + ⌊L/6⌋) р. — пока не применяется в бою',
		exampleAtL: exampleAt('×1.5 лечения · 1 р. (пока не в бою)'),
		Icon: Sparkles,
		kind: 'buff',
	},
	POISON: {
		id: 'POISON',
		label: 'Отравление',
		description: 'Наносит урон в начале хода носителя.',
		mechanics: 'DoT max(1, round(power)) за ход; иначе 3',
		exampleAtL: exampleAt('3 урона за ход'),
		Icon: Droplet,
		kind: 'debuff',
	},
	BURNING: {
		id: 'BURNING',
		label: 'Поджог',
		description: 'Наносит урон огнём в начале хода носителя.',
		mechanics: 'DoT max(1, round(power)) за ход; иначе 3',
		exampleAtL: exampleAt('3 урона за ход'),
		Icon: Flame,
		kind: 'debuff',
	},
	BLEEDING: {
		id: 'BLEEDING',
		label: 'Кровотечение',
		description: 'Наносит урон в начале хода носителя.',
		mechanics: 'DoT max(1, round(power)) за ход; иначе 3',
		exampleAtL: exampleAt('3 урона за ход'),
		Icon: Droplets,
		kind: 'debuff',
	},
	FATMAN: {
		id: 'FATMAN',
		label: 'Головокружение',
		description: 'Снижает уклонение.',
		mechanics: '−(15 + L) уклонения · 2 р.',
		exampleAtL: exampleAt('−20 уклонения · 2 р.'),
		Icon: Orbit,
		kind: 'debuff',
	},
	HAPPY: {
		id: 'HAPPY',
		label: 'Радость',
		description: 'Повышает удачу.',
		mechanics: '+(15 + 2L) удачи · 2 р.',
		exampleAtL: exampleAt('+25 удачи · 2 р.'),
		Icon: Smile,
		kind: 'buff',
	},
	CHAINED: {
		id: 'CHAINED',
		label: 'Обездвиженный',
		description: 'Сковывает цель, ограничивая манёвр.',
		mechanics: '2 р., без числового стата',
		exampleAtL: exampleAt('2 р.'),
		Icon: Link,
		kind: 'debuff',
	},
	FEAR: {
		id: 'FEAR',
		label: 'Ужас',
		description: 'Штраф к урону от подавляющего страха.',
		mechanics: '−3 урона · 2 р.',
		exampleAtL: exampleAt('−3 урона · 2 р.'),
		Icon: Ghost,
		kind: 'debuff',
	},
	VAMPWEAPON: {
		id: 'VAMPWEAPON',
		label: 'Пьющий жизни',
		description: 'Оружие вампиризирует часть нанесённого урона.',
		mechanics: '≈(0.5 + L/25) доли урона · (1 + ⌊L/7⌋) р. — пока не применяется в бою',
		exampleAtL: exampleAt('≈0.7 доли · 1 р. (пока не в бою)'),
		Icon: HeartPulse,
		kind: 'buff',
	},
};

const FALLBACK: EffectMeta = {
	id: 'GUARDED',
	label: 'Неизвестный эффект',
	description: 'Описание пока недоступно.',
	mechanics: '—',
	exampleAtL: exampleAt('—'),
	Icon: HelpCircle,
	kind: 'buff',
};

/**
 * Метаданные эффекта по id (с fallback для неизвестных).
 */
export function getEffectMeta(id: string): EffectMeta {
	const known = CATALOG[id as EffectId];
	if (known) {
		return known;
	}
	return {
		...FALLBACK,
		label: id || FALLBACK.label,
	};
}

/**
 * Все эффекты кодекса (баффы, затем дебаффы).
 */
export function listEffectCatalog(): EffectMeta[] {
	return [...listBuffs(), ...listDebuffs()];
}

/**
 * Усиления в стабильном порядке.
 */
export function listBuffs(): EffectMeta[] {
	return BUFF_ORDER.map((id) => CATALOG[id]);
}

/**
 * Ослабления в стабильном порядке.
 */
export function listDebuffs(): EffectMeta[] {
	return DEBUFF_ORDER.map((id) => CATALOG[id]);
}

/**
 * Строка для тултипа: оставшиеся раунды.
 */
export function formatEffectRounds(rounds: number): string | null {
	if (rounds <= 0) {
		return null;
	}
	return `Ещё ${rounds} р.`;
}
