import { describe, expect, test } from 'bun:test';

import type { BattleUnit } from '@/entities/match';

import {
	previewAbilityOnTarget,
	previewHeal,
	previewHealFromAbilityParts,
	previewWeaponAttack,
} from './attackPreview';

const unit = (over: Partial<BattleUnit> = {}): BattleUnit =>
	({
		id: 'u',
		playerId: 'p',
		team: 0,
		heroClassCode: 'A',
		displayName: 'A',
		row: 0,
		column: 0,
		health: 100,
		maxHp: 100,
		alive: true,
		defending: false,
		effects: [],
		isSummon: false,
		horseIsDead: false,
		mana: 0,
		maxMana: 0,
		damage: 40,
		armor: 0,
		initiative: 40,
		dodge: 0,
		luck: 0,
		accuracy: 100,
		power: 40,
		lvl: 1,
		critBank: 0,
		resists: [],
		...over,
	}) as BattleUnit;

describe('attackPreview AC-13', () => {
	test('melee range и lowDamage при max < 10', () => {
		const atk = unit({ damage: 5 });
		const def = unit({ armor: 20, id: 'd' });
		const preview = previewWeaponAttack(atk, def, 'melee');
		expect(preview.mode).toBe('damage');
		expect(preview.maxDamage).toBeLessThan(10);
		expect(preview.lowDamage).toBe(true);
		expect(preview.hitChance).toBe(100);
	});

	test('ability heal preview', () => {
		const preview = previewAbilityOnTarget(unit(), unit({ id: 'ally' }), {
			slot: 2,
			label: 'heal',
			needsTarget: true,
			disabledReason: null,
			legalTargetIds: ['ally'],
			previewHealMin: 20,
			previewHealMax: 40,
		});
		expect(preview?.mode).toBe('heal');
		expect(preview?.minDamage).toBe(20);
		expect(preview?.maxDamage).toBe(40);
		expect(preview?.hitChance).toBeNull();
	});

	test('previewHeal helper', () => {
		const preview = previewHeal(10, 10);
		expect(preview.lowDamage).toBe(false);
		expect(preview.minDamage).toBe(10);
	});

	test('previewHealFromAbilityParts: null parts не падает', () => {
		expect(previewHealFromAbilityParts(null)).toBeNull();
		expect(previewHealFromAbilityParts([{ kind: 'damage', value: 10 }])).toBeNull();
		expect(previewHealFromAbilityParts([{ kind: 'heal', value: 25 }])).toEqual(
			previewHeal(25, 25),
		);
		expect(
			previewHealFromAbilityParts([{ kind: 'healRange', min: 10, max: 40 }]),
		).toEqual(previewHeal(10, 40));
	});

	test('ability damage mult', () => {
		const atk = unit({ damage: 40 });
		const def = unit({ armor: 0, id: 'e' });
		const plain = previewWeaponAttack(atk, def, 'melee');
		const boosted = previewAbilityOnTarget(atk, def, {
			slot: 1,
			label: 'x',
			needsTarget: true,
			disabledReason: null,
			legalTargetIds: ['e'],
			attackKind: 'melee',
			previewDamageMult: 1.15,
		});
		expect(boosted).toBeTruthy();
		expect(boosted!.minDamage).toBeGreaterThan(plain.minDamage);
	});
});
