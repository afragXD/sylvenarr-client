import { describe, expect, test } from 'bun:test';

import { formatBattleUnitLabel } from './formatBattleUnitLabel';

describe('CUT-2026-11-09 AC-16 formatBattleUnitLabel', () => {
	test('герой и саммон с позициями; два одинаковых саммона различимы', () => {
		const units = [
			{
				id: 'mage',
				displayName: 'Белый маг',
				row: 1 as const,
				column: 1,
				isSummon: false,
			},
			{
				id: 'ecto1',
				displayName: 'Эктоплазма',
				row: 0 as const,
				column: 0,
				isSummon: true,
				summonerId: 'mage',
			},
			{
				id: 'ecto2',
				displayName: 'Эктоплазма',
				row: 0 as const,
				column: 2,
				isSummon: true,
				summonerId: 'mage',
			},
		];
		expect(formatBattleUnitLabel(units[0]!, units)).toBe('Белый маг (З2)');
		expect(formatBattleUnitLabel(units[1]!, units)).toBe(
			'✦ Эктоплазма (П1) — саммон Белый маг (З2)',
		);
		expect(formatBattleUnitLabel(units[2]!, units)).toBe(
			'✦ Эктоплазма (П3) — саммон Белый маг (З2)',
		);
		expect(formatBattleUnitLabel(units[1]!, units)).not.toBe(
			formatBattleUnitLabel(units[2]!, units),
		);
		expect(formatBattleUnitLabel(units[1]!, units)).not.toContain('←');
	});
});
