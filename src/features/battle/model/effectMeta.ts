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
	Icon: LucideIcon;
	kind: EffectKind;
};

/** Сколько иконок эффектов показывать на юните до бейджа +K. */
export const MAX_VISIBLE_EFFECTS = 4;

const CATALOG: Record<EffectId, EffectMeta> = {
	GUARDED: {
		id: 'GUARDED',
		label: 'Под охраной',
		description: 'Союзник прикрывает цель: повышенная защита на несколько раундов.',
		Icon: Shield,
		kind: 'buff',
	},
	STRENGTH: {
		id: 'STRENGTH',
		label: 'Сила',
		description: 'Увеличивает наносимый урон.',
		Icon: Sword,
		kind: 'buff',
	},
	BLESSED: {
		id: 'BLESSED',
		label: 'Благословение',
		description: 'Усиливает получаемое лечение.',
		Icon: Sparkles,
		kind: 'buff',
	},
	POISON: {
		id: 'POISON',
		label: 'Отравление',
		description: 'Наносит урон в начале хода носителя.',
		Icon: Droplet,
		kind: 'debuff',
	},
	BURNING: {
		id: 'BURNING',
		label: 'Поджог',
		description: 'Наносит урон огнём в начале хода носителя.',
		Icon: Flame,
		kind: 'debuff',
	},
	BLEEDING: {
		id: 'BLEEDING',
		label: 'Кровотечение',
		description: 'Наносит урон в начале хода носителя.',
		Icon: Droplets,
		kind: 'debuff',
	},
	FATMAN: {
		id: 'FATMAN',
		label: 'Головокружение',
		description: 'Снижает уклонение.',
		Icon: Orbit,
		kind: 'debuff',
	},
	HAPPY: {
		id: 'HAPPY',
		label: 'Радость',
		description: 'Повышает удачу.',
		Icon: Smile,
		kind: 'buff',
	},
	CHAINED: {
		id: 'CHAINED',
		label: 'Обездвиженный',
		description: 'Сковывает цель, ограничивая манёвр.',
		Icon: Link,
		kind: 'debuff',
	},
	FEAR: {
		id: 'FEAR',
		label: 'Ужас',
		description: 'Штраф к урону от подавляющего страха.',
		Icon: Ghost,
		kind: 'debuff',
	},
	VAMPWEAPON: {
		id: 'VAMPWEAPON',
		label: 'Пьющий жизни',
		description: 'Оружие вампиризирует часть нанесённого урона.',
		Icon: HeartPulse,
		kind: 'buff',
	},
};

const FALLBACK: EffectMeta = {
	id: 'GUARDED',
	label: 'Неизвестный эффект',
	description: 'Описание пока недоступно.',
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
 * Все эффекты кодекса в стабильном порядке.
 */
export function listEffectCatalog(): EffectMeta[] {
	return Object.values(CATALOG);
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
