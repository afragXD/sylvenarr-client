import { describe, expect, test } from 'bun:test';

import { expectedMean, expectedRandInt, pyRound } from './expectedValue';
import { getAbilityPreview } from '../model/abilityPreview';

describe('CUT AC-14 expected values', () => {
	test('expectedMean: randint(1, 2) → 1.5; randint(5, 8) → 6.5', () => {
		expect(expectedMean(1, 2)).toBe(1.5);
		expect(expectedMean(5, 8)).toBe(6.5);
	});

	test('expectedRandInt (одиночный бросок) 5…8 → 7', () => {
		expect(expectedRandInt(5, 8)).toBe(7);
	});

	test('pyRound half to even: 20.5 → 20, 21.5 → 22', () => {
		expect(pyRound(20.5)).toBe(20);
		expect(pyRound(21.5)).toBe(22);
		expect(pyRound(20.4)).toBe(20);
		expect(pyRound(20.6)).toBe(21);
	});

	test('Аббатиса power 40: превью лечения диапазоном 20…30', () => {
		const parts = getAbilityPreview('Abbess', 2, {
			lvl: 1,
			damage: 10,
			power: 40,
		});
		expect(parts).toEqual([{ kind: 'healRange', min: 20, max: 30 }]);
	});

	test('Аббатиса power 41: превью 20…31 (не матожидание)', () => {
		expect(pyRound(41 * 0.5)).toBe(20);
		expect(pyRound(41 * 0.75)).toBe(31);
		const parts = getAbilityPreview('Abbess', 2, {
			lvl: 1,
			damage: 10,
			power: 41,
		});
		expect(parts).toEqual([{ kind: 'healRange', min: 20, max: 31 }]);
	});
});
