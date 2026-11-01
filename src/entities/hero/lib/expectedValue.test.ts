import { describe, expect, test } from 'bun:test';

import { expectedRandInt, pyRound } from './expectedValue';
import { getAbilityPreview } from '../model/abilityPreview';

describe('CUT AC-14 expected values', () => {
	test('randint(5, 8) → 7 (матожидание 6.5 вверх)', () => {
		expect(expectedRandInt(5, 8)).toBe(7);
	});

	test('pyRound half to even: 20.5 → 20, 21.5 → 22', () => {
		expect(pyRound(20.5)).toBe(20);
		expect(pyRound(21.5)).toBe(22);
		expect(pyRound(20.4)).toBe(20);
		expect(pyRound(20.6)).toBe(21);
	});

	test('Аббатиса power 40: лечение ≈25', () => {
		const parts = getAbilityPreview('Abbess', 2, {
			lvl: 1,
			damage: 10,
			power: 40,
		});
		expect(parts).toEqual([{ kind: 'heal', value: 25 }]);
	});

	test('Аббатиса power 41: lo=20 hi=31 → expected 26', () => {
		// pyRound(20.5)=20, pyRound(30.75)=31; E=(20+31)/2=25.5 → ceil 26
		expect(pyRound(41 * 0.5)).toBe(20);
		expect(pyRound(41 * 0.75)).toBe(31);
		expect(expectedRandInt(20, 31)).toBe(26);
		const parts = getAbilityPreview('Abbess', 2, {
			lvl: 1,
			damage: 10,
			power: 41,
		});
		expect(parts).toEqual([{ kind: 'heal', value: 26 }]);
	});
});
