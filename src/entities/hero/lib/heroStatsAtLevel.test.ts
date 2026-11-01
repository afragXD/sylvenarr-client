import { describe, expect, test } from 'bun:test';

import type { HeroClass } from '../model/types';

import { heroStatsAtLevel } from './heroStatsAtLevel';

const abbess = (over: Partial<HeroClass> = {}): HeroClass =>
	({
		code: 'Abbess',
		displayName: 'Аббатиса',
		description: '',
		roleSummary: '',
		health: 100,
		damage: 10,
		armor: 5,
		initiative: 30,
		dodge: 0,
		luck: 0,
		morale: 0,
		mana: 5,
		maxMana: 10,
		power: 40,
		accuracy: 100,
		gold: 100,
		size: 1,
		isPlayable: true,
		tags: [],
		...over,
	}) as HeroClass;

describe('heroStatsAtLevel AC-14', () => {
	test('уровень 1 = каталог', () => {
		const base = abbess();
		const at1 = heroStatsAtLevel(base, 1);
		expect(at1.lvl).toBe(1);
		expect(at1.power).toBe(40);
		expect(at1.health).toBe(100);
	});

	test('слайдер принимает 1 и 100', () => {
		const base = abbess();
		expect(heroStatsAtLevel(base, 1).lvl).toBe(1);
		expect(heroStatsAtLevel(base, 100).lvl).toBe(100);
		expect(heroStatsAtLevel(base, 0).lvl).toBe(1);
		expect(heroStatsAtLevel(base, 999).lvl).toBe(100);
	});

	test('Аббатиса: ОЗ +5 за уровень, сила растёт', () => {
		const base = abbess();
		const at10 = heroStatsAtLevel(base, 10);
		// 9 приростов maxHp += 5 → +45
		expect(at10.health).toBe(100 + 9 * 5);
		expect(at10.power).toBeGreaterThan(40);
	});
});
