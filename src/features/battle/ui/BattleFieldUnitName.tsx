import type { BattleUnitLabelSource } from '../lib/formatBattleUnitLabel';
import { formatBattleUnitLabel } from '../lib/formatBattleUnitLabel';

type Props = {
	unit: BattleUnitLabelSource & {
		readonly defending?: boolean;
		readonly horseIsDead?: boolean;
	};
	/** Все юниты боя — для подписи саммона (AC-16). Не брать `battle` из воздуха. */
	allUnits: readonly BattleUnitLabelSource[];
	className?: string;
};

/**
 * Подпись юнита на поле. Вынесена, чтобы render-тест ловил ReferenceError
 * при обращении к несуществующему `battle` (CUT-2026-11-09 r5.1).
 */
export function BattleFieldUnitName({ unit, allUnits, className }: Props) {
	return (
		<div className={className}>
			{formatBattleUnitLabel(unit, allUnits)}
			{unit.defending ? ' 🛡' : ''}
			{unit.horseIsDead ? ' ✗конь' : ''}
		</div>
	);
}
