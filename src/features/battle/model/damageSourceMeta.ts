import type { LucideIcon } from 'lucide-react';
import {
	Brain,
	CircleOff,
	Copy,
	Crosshair,
	Droplets,
	Flame,
	Heart,
	HeartCrack,
	Mountain,
	Move,
	ShieldOff,
	Shuffle,
	Skull,
	Sparkles,
	Swords,
	TrendingDown,
	Zap,
} from 'lucide-react';

/**
 * Lucide-иконки источников урона (DamageSource сервера / SRC бота).
 * Не emoji — векторные иконки в стиле боевого UI.
 */
const SOURCE_ICONS: Record<string, LucideIcon> = {
	DEFAULT: Heart,
	WEAPON: Swords,
	ARROWS: Crosshair,
	MIND: Brain,
	DEATH: Skull,
	FIRE: Flame,
	AIR: Zap,
	EARTH: Mountain,
	WATER: Droplets,
	HOLY: Sparkles,
	STUN: CircleOff,
	DESTROYARMOR: ShieldOff,
	POLYMORPH: Shuffle,
	IMITATION: Copy,
	MOVEMENT: Move,
	FINALSTRIKE: HeartCrack,
	LOWERINGLEVEL: TrendingDown,
};

/** Иконка стихии/источника; неизвестный ключ → Heart. */
export function getDamageSourceIcon(source: string): LucideIcon {
	return SOURCE_ICONS[source] ?? Heart;
}
