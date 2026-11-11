import { describe, expect, test } from 'bun:test';

import { formatAbilityBlockReason } from './formatAbilityBlockReason';

describe('formatAbilityBlockReason', () => {
	test('normalizes cooldown labels', () => {
		expect(formatAbilityBlockReason('Кулдаун 2 р.')).toBe('перезарядка 2');
		expect(formatAbilityBlockReason('перезарядка 3')).toBe('перезарядка 3');
		// CUT-2026-11-09 AC-4: сервер шлёт N/M — не обрезать знаменатель.
		expect(formatAbilityBlockReason('перезарядка 3/4')).toBe('перезарядка 3/4');
		expect(formatAbilityBlockReason('Кулдаун 1/4')).toBe('перезарядка 1/4');
	});

	test('formats mana with current/max', () => {
		expect(formatAbilityBlockReason('Нужно 3 МР', 1, 8)).toBe('нет маны 1/8');
	});

	test('keeps other reasons', () => {
		expect(formatAbilityBlockReason('Нет целей')).toBe('Нет целей');
	});
});
