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
		// base L×2 + power×(2−ratio); power=20 → min 4+20, max 4+40; acc L+2
		const range = getAbilityPreview('Mermaid', 1, base({ lvl: 2, power: 20 }));
		expect(range).toEqual([
			{ kind: 'healRange', min: 24, max: 44 },
			{ kind: 'accuracy', value: 4 },
		]);
		const exact = getAbilityPreview('Mermaid', 1, base({ lvl: 2, power: 20, targetHpRatio: 1 }));
		expect(exact).toEqual([
			{ kind: 'heal', value: 24 },
			{ kind: 'accuracy', value: 4 },
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

	test('Knight slot 3: STRENGTH +(15+L), не +(20+2L)', () => {
		const parts = getAbilityPreview('Knight', 3, base({ lvl: 10 }));
		expect(parts).toEqual([
			{ kind: 'gold', value: 120 },
			{ kind: 'strength', value: 25 },
			{ kind: 'duration', value: 3, label: 'р. «Сила»' },
		]);
	});

	test('Knight slot 4: только длительность охраны', () => {
		expect(getAbilityPreview('Knight', 4, base())).toEqual([
			{ kind: 'duration', value: 2, label: 'р. «Под охраной»' },
		]);
	});

	test('Herbalist slot 1: кап 0.95 и длительность 1+⌊L/9⌋', () => {
		const parts = getAbilityPreview('Herbalist', 1, base({ lvl: 10, damage: 40 }));
		expect(parts).toEqual([
			{ kind: 'strength', value: 38 },
			{ kind: 'duration', value: 2, label: 'р.' },
		]);
	});

	test('EvilTree: Запретное слово 2 р.; Взращивание 1+⌊L/5⌋', () => {
		expect(getAbilityPreview('EvilTree', 3, base({ lvl: 20 }))).toEqual([
			{ kind: 'duration', value: 2, label: 'р. запрет лечения' },
		]);
		expect(getAbilityPreview('EvilTree', 5, base({ lvl: 4 }))).toEqual([
			{ kind: 'text', value: '+1 ур. цели' },
		]);
		expect(getAbilityPreview('EvilTree', 5, base({ lvl: 5 }))).toEqual([
			{ kind: 'text', value: '+2 ур. цели' },
		]);
		expect(getAbilityPreview('EvilTree', 5, base({ lvl: 10 }))).toEqual([
			{ kind: 'text', value: '+3 ур. цели' },
		]);
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

	test('Angel slot 3: урон от текущего ОЗ каждого врага', () => {
		// lvl=5 → 20%; 150 ОЗ → 30, 7 ОЗ → max(1, 1)
		const parts = getAbilityPreview(
			'Angel',
			3,
			base({
				lvl: 5,
				enemies: [
					{ displayName: 'Рыцарь', health: 150 },
					{ displayName: 'Бес', health: 7 },
				],
			}),
		);
		expect(formatAbilityPreview(parts)).toBe(
			'20% текущего ОЗ врага · Рыцарь: −30 ОЗ · Бес: −1 ОЗ',
		);
		expect(getAbilityPreview('Angel', 3, base({ lvl: 5 }))).toEqual([
			{ kind: 'text', value: '20% текущего ОЗ врага' },
		]);
	});

	test('Antipaladin slot 3: ⌊атака/3⌋ + 2L и шанс кровотечения', () => {
		expect(getAbilityPreview('Antipaladin', 3, base({ lvl: 2, damage: 24 }))).toEqual([
			{ kind: 'damage', value: 12 },
			{ kind: 'chance', value: 54, label: 'кровотечение' },
		]);
	});

	test('unknown slot returns null', () => {
		expect(getAbilityPreview('Assassin', 5, base())).toBeNull();
		expect(formatAbilityPreview(null)).toBeNull();
	});

	test('Incub slot 2: огненный хлыст, без мнимых ОЗ', () => {
		const parts = getAbilityPreview('Incub', 2, base({ lvl: 1, damage: 0, power: 30 }));
		expect(parts).toEqual([
			{ kind: 'damage', value: 30 },
			{ kind: 'duration', value: 2, label: 'р. «Извержение»' },
			{ kind: 'text', value: '−5 пп Огню навсегда' },
		]);
		expect(formatAbilityPreview(parts)).not.toContain('мнимых');
	});

	test('Oracle slot 5: мнимые ОЗ Чудесного доктора', () => {
		expect(getAbilityPreview('Oracle', 5, base({ lvl: 1 }))).toEqual([
			{ kind: 'text', value: '+55 мнимых ОЗ' },
		]);
	});
});
