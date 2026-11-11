import { describe, expect, test } from 'bun:test';

import { liveAbilityChargeLabel } from './liveAbilityChargeLabel';

describe('liveAbilityChargeLabel', () => {
	test('обновляет Святилище и Револьвер из живого юнита', () => {
		// CUT-2026-11-09 AC-24
		expect(
			liveAbilityChargeLabel('Святилище (1)', { ultaCharges: 3, gun: 0, darts: 0 }),
		).toBe('Святилище (3)');
		expect(
			liveAbilityChargeLabel('Револьвер (2)', { ultaCharges: 0, gun: 7, darts: 0 }),
		).toBe('Револьвер (7)');
		expect(
			liveAbilityChargeLabel('Дротик (1)', { ultaCharges: 0, gun: 0, darts: 4 }),
		).toBe('Дротик (4)');
	});

	test('без юнита оставляет подпись', () => {
		expect(liveAbilityChargeLabel('Святилище (1)', null)).toBe('Святилище (1)');
	});
});
