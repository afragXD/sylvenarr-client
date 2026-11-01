import { describe, expect, test } from 'bun:test';

import { formatAbilityBlockReason } from './formatAbilityBlockReason';

describe('formatAbilityBlockReason', () => {
	test('normalizes cooldown labels', () => {
		expect(formatAbilityBlockReason('Кулдаун 2 р.')).toBe('перезарядка 2');
		expect(formatAbilityBlockReason('перезарядка 3')).toBe('перезарядка 3');
	});

	test('formats mana with current/max', () => {
		expect(formatAbilityBlockReason('Нужно 3 МР', 1, 8)).toBe('нет маны 1/8');
	});

	test('keeps other reasons', () => {
		expect(formatAbilityBlockReason('Нет целей')).toBe('Нет целей');
	});
});
