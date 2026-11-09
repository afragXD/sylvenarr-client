import type { PreviewPart } from '@/entities/hero';
import type { AbilityInfo, AttackKind, BattleUnit } from '@/entities/match';

/**
 * Клиентская оценка удара/лечения по цели (CUT AC-13 п.25).
 * Дублирует формулы сервера (damage.ts): броня, тип атаки, резисты/варды.
 */
export type AttackPreview = {
	mode: 'damage' | 'heal';
	/** Шанс попадания, %; null — не применяется (лечение). */
	hitChance: number | null;
	minDamage: number;
	maxDamage: number;
	/** Шанс крита, %; null — гарантированный крит из банка или не применимо. */
	critChance: number | null;
	blockedLabel: string | null;
	resistValue: number;
	source: string | null;
	/** CUT: урон 0 или &lt; 10 — красным. */
	lowDamage: boolean;
};

export type DamagePreviewOpts = {
	readonly damageMult?: number;
	readonly armorIgnore?: number;
	readonly source?: string;
	readonly accuracyPenalty?: number;
};

/** Наведение на чужого невидимого: без прогноза урона. */
export function concealedTargetLabel(
	actor: { readonly id: string } | null,
	unit: { readonly id: string; readonly alive: boolean; readonly effects: readonly { id: string }[] },
): string | null {
	if (!actor || !unit.alive || unit.id === actor.id) {
		return null;
	}
	if (!unit.effects.some((effect) => effect.id === 'INVISIBLE')) {
		return null;
	}
	return 'Нельзя: цель невидима';
}

/** Fallback, если abilityMeta не передала previewSource (магия без source → FIRE). */
const SOURCE_BY_KIND: Record<AttackKind, string> = {
	melee: 'WEAPON',
	ranged: 'ARROWS',
	magic: 'FIRE',
};

/** Порт evade(): miss = dodge + 1 + 95 − accuracy → hit = 100 − miss, clamp 0..100. */
function previewHitChance(
	attacker: BattleUnit,
	defender: BattleUnit,
	accuracyPenalty = 0,
): number {
	if ((defender.dodgeBank ?? 0) > 0) {
		return 0;
	}
	const missChance = defender.dodge + 1 + 95 - attacker.accuracy + accuracyPenalty;
	return Math.max(0, Math.min(100, 100 - missChance));
}

function applyResist(
	defender: BattleUnit,
	source: string,
	minRaw: number,
	maxRaw: number,
): Pick<AttackPreview, 'minDamage' | 'maxDamage' | 'blockedLabel' | 'resistValue'> {
	const resist = (defender.resists ?? []).find((row) => row.source === source);
	let blockedLabel: string | null = null;
	if (resist?.immune) {
		blockedLabel = 'иммунитет';
	} else if (resist?.wardCharges != null && resist.wardCharges > 0) {
		blockedLabel = `вард ×${resist.wardCharges}`;
	}
	const resistValue = resist?.value ?? 0;
	const multiplier =
		resistValue > 0 ? Math.max(0, 1 - resistValue / 100) : 1 + Math.abs(resistValue) / 100;
	return {
		minDamage: Math.max(0, Math.round(minRaw * multiplier)),
		maxDamage: Math.max(0, Math.round(maxRaw * multiplier)),
		blockedLabel,
		resistValue,
	};
}

/**
 * Оценка урона оружием / способностью с тем же kind (и опциональным mult / ignore).
 */
export function previewWeaponAttack(
	attacker: BattleUnit,
	defender: BattleUnit,
	kind: AttackKind,
	opts: DamagePreviewOpts = {},
): AttackPreview {
	const hitChance = previewHitChance(attacker, defender, opts.accuracyPenalty ?? 0);
	const armorIgnore = Math.min(1, Math.max(0, opts.armorIgnore ?? 0));
	const armor = defender.armor * (1 - armorIgnore);
	const damageMult = opts.damageMult ?? 1;

	let minBase: number;
	let maxBase: number;
	if (kind === 'magic') {
		minBase = Math.max(1, Math.round(attacker.power * 0.8 - 3 - armor * 0.15));
		maxBase = Math.max(1, Math.round(attacker.power * 0.8 + 3 - armor * 0.15));
	} else if (kind === 'ranged') {
		minBase = Math.max(1, Math.round(attacker.damage - armor * 0.5));
		maxBase = Math.max(1, Math.round(attacker.damage - armor * 0.5 + 2));
	} else {
		minBase = Math.max(1, Math.round(attacker.damage - armor));
		maxBase = Math.max(1, Math.round(attacker.damage - armor + 2));
	}

	const minRaw = Math.max(1, Math.round(minBase * damageMult));
	const maxRaw = Math.max(1, Math.round(maxBase * damageMult));
	const source = opts.source ?? SOURCE_BY_KIND[kind];
	const resist = applyResist(defender, source, minRaw, maxRaw);
	const minDamage = resist.blockedLabel ? 0 : resist.minDamage;
	const maxDamage = resist.blockedLabel ? 0 : resist.maxDamage;

	return {
		mode: 'damage',
		hitChance: Math.round(hitChance),
		minDamage,
		maxDamage,
		critChance: attacker.critBank > 0 ? null : Math.max(0, attacker.luck),
		blockedLabel: resist.blockedLabel,
		resistValue: resist.resistValue,
		source,
		// CUT-2026-11-05 AC-9: при полном блоке показываем «0» красным.
		lowDamage: Boolean(resist.blockedLabel) || maxDamage < 10 || minDamage < 10,
	};
}

/** Превью лечения (без попадания). */
export function previewHeal(min: number, max: number): AttackPreview {
	const lo = Math.max(0, Math.round(min));
	const hi = Math.max(lo, Math.round(max));
	return {
		mode: 'heal',
		hitChance: null,
		minDamage: lo,
		maxDamage: hi,
		critChance: null,
		blockedLabel: null,
		resistValue: 0,
		source: null,
		lowDamage: false,
	};
}

/**
 * Фоллбек превью лечения из частей getAbilityPreview.
 * null parts / без heal|healRange → null (не падать на .find).
 */
export function previewHealFromAbilityParts(
	parts: PreviewPart[] | null,
): AttackPreview | null {
	if (!parts) {
		return null;
	}
	const healExact = parts.find((part) => part.kind === 'heal');
	if (healExact && healExact.kind === 'heal') {
		return previewHeal(healExact.value, healExact.value);
	}
	const healRange = parts.find((part) => part.kind === 'healRange');
	if (healRange && healRange.kind === 'healRange') {
		return previewHeal(healRange.min, healRange.max);
	}
	return null;
}

/** Оценка по AbilityInfo: урон (attackKind) или явное лечение. */
export function previewAbilityOnTarget(
	attacker: BattleUnit,
	defender: BattleUnit,
	ability: AbilityInfo,
): AttackPreview | null {
	if (
		typeof ability.previewHealMin === 'number' &&
		typeof ability.previewHealMax === 'number'
	) {
		return previewHeal(ability.previewHealMin, ability.previewHealMax);
	}
	if (!ability.attackKind) {
		return null;
	}
	return previewWeaponAttack(attacker, defender, ability.attackKind, {
		damageMult: ability.previewDamageMult,
		armorIgnore: ability.previewArmorIgnore,
		source: ability.previewSource,
		accuracyPenalty: ability.previewAccuracyPenalty,
	});
}
