/** Юнит с полями, нужными для подписи выбора (перки / предметы / prompt). */
export type BattleUnitLabelSource = {
	readonly id: string;
	readonly displayName: string;
	readonly row: number;
	readonly column: number;
	readonly isSummon?: boolean;
	readonly summonerId?: string | null;
};

/**
 * CUT-2026-11-09 AC-16: «Русалка (З2)» или
 * «✦ Эктоплазма (П1) — саммон Белого мага (П2)».
 * Совпадает с серверным unitChoiceLabel.
 */
export function formatBattleUnitLabel(
	unit: BattleUnitLabelSource,
	units: readonly BattleUnitLabelSource[],
): string {
	const place = `${unit.row === 0 ? 'П' : 'З'}${unit.column + 1}`;
	if (!unit.isSummon) {
		return `${unit.displayName} (${place})`;
	}
	const summoner = units.find((item) => item.id === unit.summonerId);
	const owner = summoner
		? ` — саммон ${summoner.displayName} (${summoner.row === 0 ? 'П' : 'З'}${summoner.column + 1})`
		: '';
	return `✦ ${unit.displayName} (${place})${owner}`;
}
