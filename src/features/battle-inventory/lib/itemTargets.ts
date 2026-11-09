import type { BattleUnit, InventoryStack } from '@/entities/match';

import { isUnholyClass } from './unholyClasses';

export function legalItemTargetIds(
	units: readonly BattleUnit[],
	invoker: BattleUnit,
	target: InventoryStack['target'],
): string[] {
	if (target === 'sellOnly' || target === 'self') {
		return target === 'self' ? [invoker.id] : [];
	}
	return units
		.filter((unit) => {
			if (!unit.alive) {
				return false;
			}
			if (
				unit.id !== invoker.id &&
				(unit.effects ?? []).some((effect) => effect.id === 'INVISIBLE')
			) {
				return false;
			}
			switch (target) {
				case 'ally':
					return unit.team === invoker.team;
				case 'allySummon':
					return unit.team === invoker.team && unit.isSummon;
				case 'enemy':
					return unit.team !== invoker.team;
				case 'enemySummon':
					return unit.team !== invoker.team && unit.isSummon && isUnholyClass(unit.heroClassCode);
				default:
					return false;
			}
		})
		.map((unit) => unit.id);
}

export function inventoryTotalCount(stacks: readonly InventoryStack[] | undefined): number {
	if (!stacks) {
		return 0;
	}
	return stacks.reduce((sum, stack) => sum + stack.quantity, 0);
}
