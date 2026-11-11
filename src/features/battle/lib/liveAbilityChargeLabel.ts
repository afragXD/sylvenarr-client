/**
 * CUT-2026-11-09 AC-24: при сером снимке способностей подставляет живые заряды из юнита.
 */
export type ChargeLabelUnit = {
	ultaCharges?: number;
	gun?: number;
	darts?: number;
};

export function liveAbilityChargeLabel(label: string, unit?: ChargeLabelUnit | null): string {
	if (!unit) {
		return label;
	}
	if (/^Револьвер\s*\(/i.test(label) && typeof unit.gun === 'number') {
		return label.replace(/\(\d+\)/, `(${unit.gun})`);
	}
	if (/^Дротик\s*\(/i.test(label) && typeof unit.darts === 'number') {
		return label.replace(/\(\d+\)/, `(${unit.darts})`);
	}
	if (/\(\d+\)/.test(label) && typeof unit.ultaCharges === 'number') {
		// Святилище / Дрожь земли / Катавасия / … — число в скобках = utlaCharges.
		return label.replace(/\((\d+)\)/, `(${unit.ultaCharges})`);
	}
	return label;
}
