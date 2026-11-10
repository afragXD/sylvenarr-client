import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { BattleFieldUnitName } from './BattleFieldUnitName';

describe('CUT-2026-11-09 r5.1 BattleFieldUnitName', () => {
	test('карточка саммона: без ReferenceError и подпись AC-16', () => {
		const units = [
			{
				id: 'mage',
				displayName: 'Белый маг',
				row: 1,
				column: 1,
				isSummon: false,
				summonerId: null,
			},
			{
				id: 'ecto',
				displayName: 'Эктоплазма',
				row: 0,
				column: 0,
				isSummon: true,
				summonerId: 'mage',
				defending: false,
				horseIsDead: false,
			},
		];
		const html = renderToStaticMarkup(
			<BattleFieldUnitName unit={units[1]!} allUnits={units} />,
		);
		expect(html).toContain('✦');
		expect(html).toContain('Эктоплазма');
		expect(html).toContain('(П1)');
		expect(html).toContain('саммон Белый маг (З2)');
	});
});
