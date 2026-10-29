import type { AttackKind, BattleUnit } from '@/entities/match';

/**
 * Клиентская оценка базовой атаки оружием по цели.
 * Дублирует формулы сервера (damage.ts): броня, тип атаки, резисты/варды цели
 * (защита даёт +50 к резистам — уже в defender.resists). Без классовых модов.
 */
export type AttackPreview = {
	/** Шанс попадания, % (20–95). */
	hitChance: number;
	/** Диапазон урона после брони и резистов (без крита). */
	minDamage: number;
	maxDamage: number;
	/** Шанс крита, %; null — гарантированный крит из банка. */
	critChance: number | null;
	/** Удар заблокирован: причина (вард/иммунитет). */
	blockedLabel: string | null;
	/** Значение резиста цели по источнику атаки (отрицательный — уязвимость). */
	resistValue: number;
	/** Источник урона атаки (для подписи). */
	source: 'WEAPON' | 'ARROWS' | 'FIRE';
};

const SOURCE_BY_KIND = {
	melee: 'WEAPON',
	ranged: 'ARROWS',
	magic: 'FIRE',
} as const;

export function previewWeaponAttack(
	attacker: BattleUnit,
	defender: BattleUnit,
	kind: AttackKind,
): AttackPreview {
	const hitChance = Math.min(95, Math.max(20, attacker.accuracy - defender.dodge / 2));

	const armor = defender.armor;

	let minRaw: number;
	let maxRaw: number;
	if (kind === 'magic') {
		minRaw = Math.max(1, Math.round(attacker.power * 0.8 - 3 - armor * 0.15));
		maxRaw = Math.max(1, Math.round(attacker.power * 0.8 + 3 - armor * 0.15));
	} else if (kind === 'ranged') {
		minRaw = Math.max(1, Math.round(attacker.damage - armor * 0.5));
		maxRaw = Math.max(1, Math.round(attacker.damage - armor * 0.5 + 2));
	} else {
		minRaw = Math.max(1, Math.round(attacker.damage - armor));
		maxRaw = Math.max(1, Math.round(attacker.damage - armor + 2));
	}

	const source = SOURCE_BY_KIND[kind];
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
		hitChance: Math.round(hitChance),
		minDamage: Math.max(0, Math.round(minRaw * multiplier)),
		maxDamage: Math.max(0, Math.round(maxRaw * multiplier)),
		critChance: attacker.critBank > 0 ? null : Math.min(40, attacker.luck),
		blockedLabel,
		resistValue,
		source,
	};
}
