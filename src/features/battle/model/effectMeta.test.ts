import { describe, expect, test } from 'bun:test';

import { getEffectMeta } from './effectMeta';

describe('getEffectMeta signed power', () => {
	test('FOCUSED: + buff, − debuff', () => {
		expect(getEffectMeta('FOCUSED', 15).kind).toBe('buff');
		expect(getEffectMeta('FOCUSED', 15).label).toBe('Повышение точности');
		expect(getEffectMeta('FOCUSED', -17).kind).toBe('debuff');
		expect(getEffectMeta('FOCUSED', -17).label).toBe('Снижение точности');
	});

	test('STRENGTH: + buff, − debuff (упадок духа)', () => {
		expect(getEffectMeta('STRENGTH', 20).kind).toBe('buff');
		expect(getEffectMeta('STRENGTH', 20).label).toBe('Сила');
		expect(getEffectMeta('STRENGTH', -1).kind).toBe('debuff');
		expect(getEffectMeta('STRENGTH', -1).label).toBe('Ослабление атаки');
	});

	test('ABSOLUTEPOWER: + buff, − debuff (упадок духа)', () => {
		expect(getEffectMeta('ABSOLUTEPOWER', 0.25).kind).toBe('buff');
		expect(getEffectMeta('ABSOLUTEPOWER', 0.25).label).toBe('Могущество');
		expect(getEffectMeta('ABSOLUTEPOWER', -8).kind).toBe('debuff');
		expect(getEffectMeta('ABSOLUTEPOWER', -8).label).toBe('Ослабление магии');
	});
});

describe('CUT-2026-11-09 AC-20 GALL example', () => {
	test('L5: 15 Вода, −4 брони, 2 р.', () => {
		const gall = getEffectMeta('GALL');
		expect(gall.exampleAtL).toBe('Например при уровне 5: 15 Вода и −4 брони за тик · 2 р.');
		expect(gall.exampleAtL).not.toMatch(/Пример при L=/);
	});
});
