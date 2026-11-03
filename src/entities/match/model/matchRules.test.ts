import { describe, expect, test } from 'bun:test';

import {
	applyPreset,
	DEFAULT_MATCH_RULES,
	detectPreset,
	formatRulesPlain,
	formatRulesSummary,
	validateMatchRules,
} from './matchRules';

describe('matchRules client', () => {
	test('defaults are valid', () => {
		const result = validateMatchRules(DEFAULT_MATCH_RULES);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.rules.heroDupes).toBe('allow');
		}
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

	test('applyPreset keeps heroDupes from base', () => {
		const next = applyPreset('classic', {
			...DEFAULT_MATCH_RULES,
			heroDupes: 'uniqueMatch',
		});
		expect(next.heroDupes).toBe('uniqueMatch');
	});

	test('rejects initial > row*2', () => {
		const result = validateMatchRules({
			...DEFAULT_MATCH_RULES,
			initialTeamSize: 5,
			maxRowSize: 2,
		});
		expect(result.ok).toBe(false);
	});

	test('formatRulesSummary appends dupes mode', () => {
		expect(formatRulesSummary(DEFAULT_MATCH_RULES)).not.toContain('дубл');
		expect(formatRulesSummary({ ...DEFAULT_MATCH_RULES, heroDupes: 'uniqueTeam' })).toContain(
			'без дублей',
		);
		expect(formatRulesSummary({ ...DEFAULT_MATCH_RULES, heroDupes: 'uniqueMatch' })).toContain(
			'уникальны в матче',
		);
	});

	test('rejects startingLevel out of range', () => {
		expect(validateMatchRules({ ...DEFAULT_MATCH_RULES, startingLevel: 0 }).ok).toBe(false);
		expect(validateMatchRules({ ...DEFAULT_MATCH_RULES, startingLevel: 31 }).ok).toBe(false);
	});

	test('formatRulesSummary shows starting level when above 1', () => {
		expect(formatRulesSummary({ ...DEFAULT_MATCH_RULES, startingLevel: 10 })).toContain('ур. 10');
	});

	test('formatRulesSummary marks friendly match', () => {
		expect(formatRulesSummary(DEFAULT_MATCH_RULES)).not.toContain('товарищеский');
		expect(formatRulesSummary({ ...DEFAULT_MATCH_RULES, rated: false })).toContain('товарищеский');
	});

	test('applyPreset keeps rated from base', () => {
		const next = applyPreset('fast', { ...DEFAULT_MATCH_RULES, rated: false });
		expect(next.rated).toBe(false);
	});

	test('applyPreset resets fairEnabled to off', () => {
		const next = applyPreset('classic', {
			...DEFAULT_MATCH_RULES,
			fairEnabled: true,
			fairFrequency: 3,
			shopSize: 12,
			goldBonus: 2,
		});
		expect(next.fairEnabled).toBe(false);
		expect(next.fairFrequency).toBe(DEFAULT_MATCH_RULES.fairFrequency);
		expect(next.shopSize).toBe(DEFAULT_MATCH_RULES.shopSize);
		expect(next.goldBonus).toBe(DEFAULT_MATCH_RULES.goldBonus);
	});

	test('validateMatchRules snaps goldBonus to 0.25 step', () => {
		const result = validateMatchRules({ ...DEFAULT_MATCH_RULES, goldBonus: 1.07 });
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.rules.goldBonus).toBe(1);
		}
	});

	test('formatRulesPlain uses spoken wording', () => {
		expect(formatRulesPlain(DEFAULT_MATCH_RULES)).toBe(
			'3 героя из 8 слотов · до 4 в ряду · 20 раундов · старт с 65 % здоровья',
		);
		expect(
			formatRulesPlain({ ...DEFAULT_MATCH_RULES, rated: false, heroDupes: 'uniqueTeam' }),
		).toContain('товарищеский');
		expect(
			formatRulesPlain({ ...DEFAULT_MATCH_RULES, rated: false, heroDupes: 'uniqueTeam' }),
		).toContain('без дублей в отряде');
	});
});
