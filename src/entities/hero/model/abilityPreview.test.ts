import { describe, expect, test } from 'bun:test';

import {
	formatAbilityPreview,
	getAbilityPreview,
	type PreviewCtx,
	previewCtxFromHero,
} from './abilityPreview';

const base = (over: Partial<PreviewCtx> = {}): PreviewCtx => ({
	lvl: 1,
	damage: 20,
	power: 0,
	health: 100,
	maxHp: 100,
	luck: 0,
	gold: 300,
	cumRage: 0,
	...over,
});

describe('abilityPreview', () => {
	test('Assassin slot 1: damage ×1.15', () => {
		const parts = getAbilityPreview('Assassin', 1, base({ damage: 20 }));
		expect(parts).toEqual([{ kind: 'damage', value: 23 }]);
		expect(formatAbilityPreview(parts)).toBe('≈23 урона до брони и попадания');
	});

	test('atk preview uses max(damage, power)', () => {
		expect(getAbilityPreview('EvilTree', 2, base({ damage: 0, power: 30 }))).toEqual([
			{ kind: 'damage', value: 36 },
		]);
		expect(getAbilityPreview('Assassin', 1, base({ damage: 20, power: 30 }))).toEqual([
			{ kind: 'damage', value: 35 },
		]);
	});

	test('Patriarch slot 2: heal L×7 + floor(power/3)', () => {
		// lvl=10, power=30 → 70 + 10 = 80
		const parts = getAbilityPreview('Patriarch', 2, base({ lvl: 10, power: 30 }));
		expect(parts).toEqual([{ kind: 'heal', value: 80 }]);
	});

	test('Herbalist slot 4: heal 5 + lvl', () => {
		const parts = getAbilityPreview('Herbalist', 4, base({ lvl: 3 }));
		expect(parts).toEqual([{ kind: 'heal', value: 8 }]);
	});

	test('Mermaid slot 1: heal range without target; exact with ratio', () => {
		const range = getAbilityPreview('Mermaid', 1, base({ lvl: 2 }));
		expect(range).toEqual([
			{ kind: 'healRange', min: 30, max: 50 },
			{ kind: 'accuracy', value: 6 },
		]);
		const exact = getAbilityPreview('Mermaid', 1, base({ lvl: 2, targetHpRatio: 1 }));
		expect(exact).toEqual([
			{ kind: 'heal', value: 30 },
			{ kind: 'accuracy', value: 6 },
		]);
	});

	test('OrcKing passive: luck steal lvl−1', () => {
		const parts = getAbilityPreview('OrcKing', 'passive', base({ lvl: 5 }));
		expect(parts).toEqual([
			{ kind: 'luck', value: 4, note: 'если удача < −10' },
		]);
		expect(formatAbilityPreview(parts)).toContain('−4 удачи');
	});

	test('OrcKing slot 1: damage ×1.1×rage at full HP', () => {
		// rage at full HP, cumRage 0 → 1.0; mult 1.1; dmg 20 → 22
		const parts = getAbilityPreview(
			'OrcKing',
			1,
			base({ damage: 20, health: 100, maxHp: 100, cumRage: 0 }),
		);
		expect(parts).toEqual([{ kind: 'damage', value: 22 }]);
	});

	test('Knight slot 1: damage ×1.05', () => {
		const parts = getAbilityPreview('Knight', 1, base({ damage: 20 }));
		expect(parts).toEqual([{ kind: 'damage', value: 21 }]);
	});

	test('registry label на 1 ур.', () => {
		const ctx = previewCtxFromHero({
			damage: 16,
			power: 28,
			health: 115,
			luck: 5,
			gold: 350,
		});
		expect(ctx.lvl).toBe(1);
		const text = formatAbilityPreview(getAbilityPreview('Paladin', 1, ctx), {
			atLevelLabel: 'на 1 ур.',
		});
		expect(text).toContain('на 1 ур.');
		expect(text).toContain('урона до брони');
	});

	test('unknown slot returns null', () => {
		expect(getAbilityPreview('Assassin', 5, base())).toBeNull();
		expect(formatAbilityPreview(null)).toBeNull();
	});
});
