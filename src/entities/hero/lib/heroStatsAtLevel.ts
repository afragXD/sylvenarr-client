import type { HeroClass } from '../model/types';

import { expectedRandInt } from './expectedValue';

export type HeroStatsSnapshot = {
	lvl: number;
	health: number;
	damage: number;
	armor: number;
	initiative: number;
	dodge: number;
	luck: number;
	morale: number;
	mana: number;
	maxMana: number;
	power: number;
	accuracy: number;
	gold: number;
	size: number;
};

type MutableStats = {
	lvl: number;
	hiddenLvl: number;
	health: number;
	maxHp: number;
	damage: number;
	armor: number;
	initiative: number;
	dodge: number;
	luck: number;
	morale: number;
	mana: number;
	maxMana: number;
	power: number;
	accuracy: number;
	gold: number;
};

type LevelGainFn = (s: MutableStats) => void;

const addMana = (s: MutableStats, amount: number): void => {
	if (amount <= 0 || s.maxMana <= 0) {
		return;
	}
	s.mana = Math.min(s.maxMana, s.mana + amount);
};

const bump = (s: MutableStats): void => {
	s.lvl += 1;
	s.hiddenLvl += 1;
};

/**
 * Ожидаемые приросты (без stage-бонусов боя) — порт levelup/pilots.ts.
 * Случайные слагаемые → expectedRandInt.
 */
const LEVEL_GAINS: Record<string, LevelGainFn> = {
	Assassin(s) {
		s.luck += expectedRandInt(1, 3);
		s.damage += s.lvl;
		bump(s);
	},
	Paladin(s) {
		s.armor += expectedRandInt(1, 2) * Math.floor(s.lvl / 3);
		s.damage += 2 + Math.floor(s.lvl / 4);
		bump(s);
	},
	Inquisitor(s) {
		s.damage += expectedRandInt(1, 3) + Math.floor(s.lvl / 3);
		addMana(s, expectedRandInt(1, 2));
		bump(s);
	},
	Detective(s) {
		s.dodge += expectedRandInt(1, 2);
		s.damage += Math.floor(s.lvl / 2) + expectedRandInt(1, 3);
		bump(s);
	},
	DemonLord(s) {
		s.power += expectedRandInt(2, 4);
		s.luck += 2;
		addMana(s, 1);
		s.damage += Math.floor(s.lvl / 2) + expectedRandInt(1, 2);
		s.initiative += expectedRandInt(-2, 3);
		bump(s);
	},
	Abbess(s) {
		s.power += expectedRandInt(0, 2) + Math.floor(s.lvl / 2);
		addMana(s, 1);
		s.maxHp += 5;
		s.health = s.maxHp;
		bump(s);
	},
	OrcKing(s) {
		s.luck += s.luck <= 0 ? Math.floor(s.lvl / 2) + 3 : 2;
		s.damage += Math.floor(s.lvl / 2) + 1;
		s.accuracy += 2;
		bump(s);
	},
	Marauder(s) {
		s.damage += expectedRandInt(2, 5) + Math.floor(s.lvl / 2);
		s.gold += expectedRandInt(30, 50);
		addMana(s, 1);
		s.power += Math.floor(s.lvl / 2) + 1;
		bump(s);
	},
	Werewolf(s) {
		s.damage += expectedRandInt(2, 3) + Math.floor(s.lvl / 2);
		s.luck += Math.floor(s.lvl / 2) + 1;
		s.maxHp += s.lvl * 2 + expectedRandInt(1, 5);
		s.health = s.maxHp;
		s.morale -= expectedRandInt(4, 6);
		bump(s);
	},
	Archlich(s) {
		s.power += Math.floor((expectedRandInt(0, 2) * s.lvl) / 2);
		addMana(s, expectedRandInt(1, 2));
		bump(s);
	},
	Witch(s) {
		// CUT-2026-11-05: прирост урона как у Мародёра (без раундового спайка).
		s.damage += expectedRandInt(2, 5) + Math.floor(s.lvl / 2);
		addMana(s, expectedRandInt(1, 2));
		s.power += Math.floor(s.lvl / 2) + 3;
		bump(s);
	},
	GhostWarrior(s) {
		s.damage += 1 + Math.floor(s.lvl / 4);
		s.initiative += 2;
		bump(s);
	},
	Oracle(s) {
		addMana(s, 2);
		bump(s);
	},
	Herbalist(s) {
		s.armor += 2;
		s.damage += expectedRandInt(2, 3);
		bump(s);
	},
	Demiurge(s) {
		bump(s);
		s.power += 2;
		addMana(s, expectedRandInt(1, 3));
		s.armor += 2;
	},
	GoldGolem(s) {
		s.damage += 2;
		bump(s);
	},
	BeerElemental(s) {
		s.power += expectedRandInt(1, 2);
		s.luck += 1;
		bump(s);
	},
	Knight(s) {
		const armorFloorBefore = Math.floor(s.lvl / 4);
		s.armor += 2;
		s.accuracy += 3;
		s.damage += expectedRandInt(1, 2) + Math.floor(s.lvl / 3);
		bump(s);
		s.armor += Math.floor(s.lvl / 4) - armorFloorBefore;
	},
	Mermaid(s) {
		addMana(s, 1);
		bump(s);
	},
	Patriarch(s) {
		s.armor += 3;
		s.power += 4;
		addMana(s, 1);
		bump(s);
	},
	Pyro(s) {
		s.damage += 2;
		s.power += 2 + Math.floor(s.lvl / 3);
		bump(s);
	},
	EvilTree(s) {
		s.damage += expectedRandInt(1, 3);
		s.power += expectedRandInt(2, 3);
		addMana(s, expectedRandInt(1, 2));
		bump(s);
	},
	Dracolich(s) {
		s.damage += 2;
		s.power += 2;
		bump(s);
	},
	Antipaladin(s) {
		s.armor += expectedRandInt(1, 2) * Math.floor(s.lvl / 4);
		s.damage += expectedRandInt(1, 3) + Math.floor(s.lvl / 3);
		bump(s);
	},
	Angel(s) {
		s.power += expectedRandInt(1, 2);
		s.initiative += expectedRandInt(1, 2);
		s.dodge += 1;
		s.luck += expectedRandInt(1, 2);
		bump(s);
	},
	Titan(s) {
		s.power += Math.floor(s.lvl / 4) + 3;
		s.maxHp += 10;
		s.health = s.maxHp;
		s.damage += Math.floor(s.lvl / 3) + 2;
		s.luck += expectedRandInt(0, 1);
		addMana(s, 1);
		bump(s);
	},
	Incub(s) {
		s.power += 2 + Math.floor(s.lvl / 5);
		s.initiative += expectedRandInt(0, 1);
		s.armor += 1;
		addMana(s, expectedRandInt(2, 3));
		bump(s);
	},
	SkeletonChampion(s) {
		s.damage += expectedRandInt(2, 5);
		s.luck += 2;
		bump(s);
	},
};

/** Фоллбек: только уровень в превью способностей, статы каталога. */
const fallbackGain: LevelGainFn = (s) => {
	bump(s);
};

/**
 * Статы героя на выбранном уровне (1–100): каталог L1 + ожидаемые приросты.
 */
export function heroStatsAtLevel(hero: HeroClass, level: number): HeroStatsSnapshot {
	const target = Math.min(100, Math.max(1, Math.round(level)));
	const s: MutableStats = {
		lvl: 1,
		hiddenLvl: 1,
		health: hero.health,
		maxHp: hero.health,
		damage: hero.damage,
		armor: hero.armor,
		initiative: hero.initiative,
		dodge: hero.dodge,
		luck: hero.luck,
		morale: hero.morale,
		mana: hero.mana,
		maxMana: hero.maxMana,
		power: hero.power,
		accuracy: hero.accuracy,
		gold: hero.gold,
	};
	const gain = LEVEL_GAINS[hero.code] ?? fallbackGain;
	while (s.lvl < target) {
		gain(s);
	}
	return {
		lvl: s.lvl,
		health: s.health,
		damage: s.damage,
		armor: s.armor,
		initiative: s.initiative,
		dodge: s.dodge,
		luck: s.luck,
		morale: s.morale,
		mana: s.mana,
		maxMana: s.maxMana,
		power: s.power,
		accuracy: s.accuracy,
		gold: s.gold,
		size: hero.size,
	};
}
