import { describe, expect, test } from 'bun:test';

import {
	DEFAULT_MATCH_RULES,
	applyPreset,
	detectPreset,
	validateMatchRules,
} from './matchRules';

describe('matchRules client', () => {
	test('defaults are valid', () => {
		const result = validateMatchRules(DEFAULT_MATCH_RULES);
		expect(result.ok).toBe(true);
	});

	test('detects classic preset', () => {
		expect(detectPreset(DEFAULT_MATCH_RULES)).toBe('classic');
	});

	test('applyPreset fast then detect', () => {
		const next = applyPreset('fast', DEFAULT_MATCH_RULES);
		expect(detectPreset(next)).toBe('fast');
		expect(next.maxRounds).toBe(10);
		expect(next.healthBonus).toBe(0.35);
	});

	test('rejects initial > row*2', () => {
		const result = validateMatchRules({
			...DEFAULT_MATCH_RULES,
			initialTeamSize: 5,
			maxRowSize: 2,
		});
		expect(result.ok).toBe(false);
	});
});
