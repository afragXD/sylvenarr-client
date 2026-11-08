import { describe, expect, test } from 'bun:test';

import type { HeroClass } from '../model/types';
import { getAbilityPreview } from '../model/abilityPreview';

import { expectedMean } from './expectedValue';
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

	test('CUT-2026-11-05: Кентавр L8 броня = 31', () => {
		const knight = abbess({
			code: 'Knight',
			health: 210,
			damage: 20,
			armor: 15,
			initiative: 40,
			accuracy: 92,
			mana: 0,
			maxMana: 0,
			power: 0,
		});
		expect(heroStatsAtLevel(knight, 8).armor).toBe(31);
	});

	test('случайный прирост: сумма средних, один ceil (1–2 → 1.5) на L1/15/30', () => {
		const beer = abbess({
			code: 'BeerElemental',
			power: 10,
			luck: 0,
			mana: 0,
			maxMana: 0,
		});
		expect(expectedMean(1, 2)).toBe(1.5);
		expect(heroStatsAtLevel(beer, 1).power).toBe(10);
		// 14 приростов × 1.5 = 21
		expect(heroStatsAtLevel(beer, 15).power).toBe(10 + 14 * 1.5);
		// 29 × 1.5 = 43.5 → ceil → 44
		expect(heroStatsAtLevel(beer, 30).power).toBe(10 + Math.ceil(29 * 1.5));
		// Старый ceil-на-уровне дал бы 10+29*2=68
		expect(heroStatsAtLevel(beer, 30).power).toBeLessThan(10 + 29 * 2);
	});

	test('L1/15/30: Архилич сила, Травница урон, Воин-призрак превью, Мародёр золото', () => {
		const archlich = abbess({
			code: 'Archlich',
			power: 32,
			mana: 14,
			maxMana: 14,
			gold: 400,
			damage: 5,
			armor: 5,
			health: 215,
		});
		expect(heroStatsAtLevel(archlich, 1).power).toBe(32);
		expect(heroStatsAtLevel(archlich, 15).power).toBe(84);
		expect(heroStatsAtLevel(archlich, 30).power).toBe(247);

		const herbalist = abbess({
			code: 'Herbalist',
			damage: 18,
			armor: 20,
			health: 165,
			power: 30,
			mana: 3,
			maxMana: 3,
		});
		expect(heroStatsAtLevel(herbalist, 1).damage).toBe(18);
		expect(heroStatsAtLevel(herbalist, 15).damage).toBe(53);
		expect(heroStatsAtLevel(herbalist, 30).damage).toBe(91);

		const marauder = abbess({
			code: 'Marauder',
			gold: 430,
			damage: 24,
			power: 25,
			mana: 7,
			maxMana: 7,
			health: 210,
			luck: 8,
		});
		expect(heroStatsAtLevel(marauder, 1).gold).toBe(430);
		expect(heroStatsAtLevel(marauder, 15).gold).toBe(990);
		expect(heroStatsAtLevel(marauder, 30).gold).toBe(1590);

		const gw = abbess({
			code: 'GhostWarrior',
			damage: 23,
			dodge: 7,
			initiative: 15,
			power: 0,
			mana: 0,
			maxMana: 0,
			accuracy: 95,
			gold: 50,
		});
		for (const [lvl, lo, hi] of [
			[1, 6, 9],
			[15, 20, 23],
			[30, 35, 38],
		] as const) {
			const preview = getAbilityPreview('GhostWarrior', 1, {
				lvl,
				damage: 23,
				power: 0,
			});
			expect(
				preview.some(
					(p) => p.kind === 'text' && p.value.includes(`−(${lo}…${hi}) морали`),
				),
			).toBe(true);
		}
		expect(heroStatsAtLevel(gw, 1).damage).toBe(23);
		expect(heroStatsAtLevel(gw, 15).initiative).toBe(15 + 14 * 2);
		expect(heroStatsAtLevel(gw, 30).initiative).toBe(15 + 29 * 2);
	});

	test('CUT-2026-11-05 AC-9: все 27 playable кодов дают статы на L1/15/30', () => {
		const codes = [
			'Assassin',
			'Paladin',
			'Inquisitor',
			'Detective',
			'DemonLord',
			'Abbess',
			'OrcKing',
			'Marauder',
			'Werewolf',
			'Archlich',
			'Witch',
			'GhostWarrior',
			'Specter',
			'Oracle',
			'Herbalist',
			'Demiurge',
			'GoldGolem',
			'BeerElemental',
			'Knight',
			'Mermaid',
			'Patriarch',
			'Pyro',
			'EvilTree',
			'Dracolich',
			'Antipaladin',
			'Angel',
			'Titan',
		] as const;
		expect(codes.length).toBe(27);
		for (const code of codes) {
			const hero = abbess({ code, armor: code === 'Knight' ? 15 : 5 });
			for (const lvl of [1, 15, 30] as const) {
				const snap = heroStatsAtLevel(hero, lvl);
				expect(snap.lvl).toBe(lvl);
				expect(Number.isFinite(snap.damage)).toBe(true);
				expect(Number.isFinite(snap.armor)).toBe(true);
				expect(Number.isFinite(snap.power)).toBe(true);
				expect(snap.health).toBeGreaterThan(0);
			}
		}
	});
});
