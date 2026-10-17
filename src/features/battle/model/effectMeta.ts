import type { LucideIcon } from 'lucide-react';
import {
	Ban,
	Biohazard,
	Brain,
	Bug,
	Clover,
	Crosshair,
	Droplet,
	Droplets,
	EyeOff,
	Flame,
	Focus,
	Ghost,
	Hand,
	Heart,
	HeartPulse,
	HelpCircle,
	Link,
	Mountain,
	Orbit,
	Shield,
	ShieldOff,
	Skull,
	Smile,
	Sparkles,
	Swords,
	Sword,
	ThumbsDown,
	Timer,
	VolumeX,
	WifiOff,
	Zap,
	ZapOff,
} from 'lucide-react';

export type EffectId =
	| 'GUARDED'
	| 'STRENGTH'
	| 'BLESSED'
	| 'POISON'
	| 'BURNING'
	| 'BLEEDING'
	| 'FATMAN'
	| 'HAPPY'
	| 'CHAINED'
	| 'FEAR'
	| 'VAMPWEAPON'
	| 'REGENHP'
	| 'HASTE'
	| 'CHAMELEON'
	| 'PETRIFIED'
	| 'SLOW'
	| 'STONEFLESH'
	| 'CONTR'
	| 'MARKED'
	| 'DEATHSENTENCE'
	| 'INTERFERENCE'
	| 'SILENCE'
	| 'IMPISH'
	| 'LUCKY'
	| 'FOCUSED'
	| 'STUNNED'
	| 'WEAKNESS'
	| 'UNLUCKY'
	| 'GALL'
	| 'SANCTUM'
	| 'FIREDWEAPON'
	| 'MIND_WARD'
	| 'INVISIBLE'
	| 'INTERDICT'
	| 'MAGIC_SHACKLES'
	| 'ENSLAVED'
	| 'ROW_FORTIFY';

export type EffectKind = 'buff' | 'debuff';

export type EffectMeta = {
	id: EffectId;
	label: string;
	description: string;
	mechanics: string;
	exampleAtL: string;
	Icon: LucideIcon;
	kind: EffectKind;
};

export const MAX_VISIBLE_EFFECTS = 4;
export const CODEX_L = 5;

const exampleAt = (value: string): string => `Например при уровне ${CODEX_L}: ${value}`;

const BUFF_ORDER: EffectId[] = [
	'GUARDED',
	'STRENGTH',
	'BLESSED',
	'HAPPY',
	'VAMPWEAPON',
	'REGENHP',
	'HASTE',
	'CHAMELEON',
	'STONEFLESH',
	'CONTR',
	'LUCKY',
	'FOCUSED',
	'SANCTUM',
	'FIREDWEAPON',
	'MIND_WARD',
	'INVISIBLE',
	'ROW_FORTIFY',
];

const DEBUFF_ORDER: EffectId[] = [
	'POISON',
	'BURNING',
	'BLEEDING',
	'FATMAN',
	'CHAINED',
	'FEAR',
	'PETRIFIED',
	'SLOW',
	'MARKED',
	'DEATHSENTENCE',
	'INTERFERENCE',
	'SILENCE',
	'IMPISH',
	'STUNNED',
	'WEAKNESS',
	'UNLUCKY',
	'GALL',
	'INTERDICT',
	'MAGIC_SHACKLES',
	'ENSLAVED',
];

const CATALOG: Record<EffectId, EffectMeta> = {
	GUARDED: {
		id: 'GUARDED',
		label: 'Под охраной',
		description: 'Союзник прикрывает цель: повышенная защита на несколько раундов.',
		mechanics: '+3 брони · 2 р.',
		exampleAtL: exampleAt('+3 брони · 2 р.'),
		Icon: Shield,
		kind: 'buff',
	},
	STRENGTH: {
		id: 'STRENGTH',
		label: 'Сила',
		description: 'Увеличивает наносимый урон.',
		mechanics: '+(20 + 2L) урона · (1 + ⌊L/5⌋) р.',
		exampleAtL: exampleAt('+30 урона · 2 р.'),
		Icon: Sword,
		kind: 'buff',
	},
	BLESSED: {
		id: 'BLESSED',
		label: 'Благословение',
		description: 'Усиливает получаемое лечение.',
		mechanics: 'лечение ×(1 + power) · (1 + ⌊L/6⌋) р.',
		exampleAtL: exampleAt('×1.5 лечения · 1 р.'),
		Icon: Sparkles,
		kind: 'buff',
	},
	POISON: {
		id: 'POISON',
		label: 'Отравление',
		description: 'Наносит урон в начале хода носителя.',
		mechanics: 'DoT max(1, round(power)) за ход; иначе 3',
		exampleAtL: exampleAt('3 урона за ход'),
		Icon: Droplet,
		kind: 'debuff',
	},
	BURNING: {
		id: 'BURNING',
		label: 'Поджог',
		description: 'Наносит урон огнём в начале хода носителя.',
		mechanics: 'DoT max(1, round(power)) за ход; иначе 3',
		exampleAtL: exampleAt('3 урона за ход'),
		Icon: Flame,
		kind: 'debuff',
	},
	BLEEDING: {
		id: 'BLEEDING',
		label: 'Кровотечение',
		description: 'Наносит урон в начале хода носителя.',
		mechanics: 'DoT max(1, round(power)) за ход; иначе 3',
		exampleAtL: exampleAt('3 урона за ход'),
		Icon: Droplets,
		kind: 'debuff',
	},
	FATMAN: {
		id: 'FATMAN',
		label: 'Головокружение',
		description: 'Снижает уклонение.',
		mechanics: '−(15 + L) уклонения · 2 р.',
		exampleAtL: exampleAt('−20 уклонения · 2 р.'),
		Icon: Orbit,
		kind: 'debuff',
	},
	HAPPY: {
		id: 'HAPPY',
		label: 'Радость',
		description: 'Повышает удачу.',
		mechanics: '+(15 + 2L) удачи · 2 р.',
		exampleAtL: exampleAt('+25 удачи · 2 р.'),
		Icon: Smile,
		kind: 'buff',
	},
	CHAINED: {
		id: 'CHAINED',
		label: 'Обездвиженный',
		description: 'Сковывает цель, ограничивая манёвр.',
		mechanics: '2 р., без числового стата',
		exampleAtL: exampleAt('2 р.'),
		Icon: Link,
		kind: 'debuff',
	},
	FEAR: {
		id: 'FEAR',
		label: 'Ужас',
		description: 'Штраф к урону от подавляющего страха.',
		mechanics: '−power к урону · 2 р. (снимается с откатом)',
		exampleAtL: exampleAt('−3 урона · 2 р.'),
		Icon: Ghost,
		kind: 'debuff',
	},
	VAMPWEAPON: {
		id: 'VAMPWEAPON',
		label: 'Пьющий жизни',
		description: 'Оружие вампиризирует часть нанесённого урона.',
		mechanics: 'heal ≈ power × урон · (1 + ⌊L/7⌋) р.',
		exampleAtL: exampleAt('≈0.7 доли · 1 р.'),
		Icon: HeartPulse,
		kind: 'buff',
	},
	REGENHP: {
		id: 'REGENHP',
		label: 'Регенерация',
		description: 'Восстанавливает ОЗ в начале хода.',
		mechanics: 'heal ≈ 6%×maxHp×power за ход',
		exampleAtL: exampleAt('несколько ОЗ каждый ход'),
		Icon: Heart,
		kind: 'buff',
	},
	HASTE: {
		id: 'HASTE',
		label: 'Ускорение',
		description: 'Повышает инициативу.',
		mechanics: '+power к инициативе · 2 р.',
		exampleAtL: exampleAt('+20 инициативы · 2 р.'),
		Icon: Zap,
		kind: 'buff',
	},
	CHAMELEON: {
		id: 'CHAMELEON',
		label: 'Хамелеон',
		description: 'Повышает уклонение.',
		mechanics: '+power к уклонению · 1 р.',
		exampleAtL: exampleAt('+20 уклонения · 1 р.'),
		Icon: EyeOff,
		kind: 'buff',
	},
	PETRIFIED: {
		id: 'PETRIFIED',
		label: 'Окаменение',
		description: 'Каменная кожа: сильно повышает броню, часто со сковыванием.',
		mechanics: '+power брони · 2 р.',
		exampleAtL: exampleAt('+15 брони · 2 р.'),
		Icon: Mountain,
		kind: 'debuff',
	},
	SLOW: {
		id: 'SLOW',
		label: 'Замедление',
		description: 'Снижает инициативу.',
		mechanics: '−power к инициативе · 2 р.',
		exampleAtL: exampleAt('−20 инициативы · 2 р.'),
		Icon: Timer,
		kind: 'debuff',
	},
	STONEFLESH: {
		id: 'STONEFLESH',
		label: 'Каменная плоть',
		description: 'Временно усиливает броню союзника.',
		mechanics: '+power брони · (2 + ⌊L/4⌋) р.',
		exampleAtL: exampleAt('+30 брони · 3 р.'),
		Icon: Mountain,
		kind: 'buff',
	},
	CONTR: {
		id: 'CONTR',
		label: 'Контрудар',
		description: 'Отвечает ближним ударом после получения урона.',
		mechanics: '1 контрудар melee после hit · 2+ р.',
		exampleAtL: exampleAt('контрудар · 3 р.'),
		Icon: Swords,
		kind: 'buff',
	},
	MARKED: {
		id: 'MARKED',
		label: 'Метка',
		description: 'Цель помечена для добивания.',
		mechanics: 'метка без статов · (2 + ⌊L/6⌋) р.',
		exampleAtL: exampleAt('2 р.'),
		Icon: Crosshair,
		kind: 'debuff',
	},
	DEATHSENTENCE: {
		id: 'DEATHSENTENCE',
		label: 'Смертный приговор',
		description: 'Ослабляет защиту (proxy резистов Разум/Смерть).',
		mechanics: '−power к броне · 2 р.',
		exampleAtL: exampleAt('−8 брони · 2 р.'),
		Icon: Skull,
		kind: 'debuff',
	},
	INTERFERENCE: {
		id: 'INTERFERENCE',
		label: 'Помехи',
		description: 'Снижает силу магии.',
		mechanics: '−power к силе · (1 + ⌊L/6⌋) р.',
		exampleAtL: exampleAt('−доля силы · 1 р.'),
		Icon: WifiOff,
		kind: 'debuff',
	},
	SILENCE: {
		id: 'SILENCE',
		label: 'Немота',
		description: 'Блокирует трату маны и магические способности.',
		mechanics: 'запрет spendMana · 2 р.',
		exampleAtL: exampleAt('2 р.'),
		Icon: VolumeX,
		kind: 'debuff',
	},
	IMPISH: {
		id: 'IMPISH',
		label: 'Бес',
		description: 'Полиморф: без брони и со штрафом к урону; броня вернётся.',
		mechanics: 'armor→0, −power урона · 2 р.',
		exampleAtL: exampleAt('−5 урона · 2 р.'),
		Icon: Bug,
		kind: 'debuff',
	},
	LUCKY: {
		id: 'LUCKY',
		label: 'Удача',
		description: 'Повышает удачу (крит/шансы).',
		mechanics: '+power удачи · 2 р.',
		exampleAtL: exampleAt('+20 удачи · 2 р.'),
		Icon: Clover,
		kind: 'buff',
	},
	FOCUSED: {
		id: 'FOCUSED',
		label: 'Сосредоточение',
		description: 'Повышает точность.',
		mechanics: '+power точности · 2 р.',
		exampleAtL: exampleAt('+15 точности · 2 р.'),
		Icon: Focus,
		kind: 'buff',
	},
	STUNNED: {
		id: 'STUNNED',
		label: 'Оглушение',
		description: 'Пропускает следующий ход.',
		mechanics: 'skip turn · 1 р.',
		exampleAtL: exampleAt('1 пропуск хода'),
		Icon: ZapOff,
		kind: 'debuff',
	},
	WEAKNESS: {
		id: 'WEAKNESS',
		label: 'Слабость',
		description: 'Снижает физический урон.',
		mechanics: '−power к урону · 2 р.',
		exampleAtL: exampleAt('−30% урона · 2 р.'),
		Icon: ShieldOff,
		kind: 'debuff',
	},
	UNLUCKY: {
		id: 'UNLUCKY',
		label: 'Неудача',
		description: 'Снижает удачу и шанс крита.',
		mechanics: '−power к удаче · (1 + ⌊L/5⌋) р.',
		exampleAtL: exampleAt('−20 удачи · 2 р.'),
		Icon: ThumbsDown,
		kind: 'debuff',
	},
	GALL: {
		id: 'GALL',
		label: 'Желчь',
		description: 'DoT и разъедание брони.',
		mechanics: 'DoT + −armor · (2 + ⌊L/5⌋) р.',
		exampleAtL: exampleAt('DoT · 3 р.'),
		Icon: Biohazard,
		kind: 'debuff',
	},
	SANCTUM: {
		id: 'SANCTUM',
		label: 'Святилище',
		description: 'Нельзя выбрать целью атаки и вражеских способностей.',
		mechanics: 'untargetable · (2 + ⌊L/5⌋) р.',
		exampleAtL: exampleAt('3 р.'),
		Icon: Sparkles,
		kind: 'buff',
	},
	FIREDWEAPON: {
		id: 'FIREDWEAPON',
		label: 'Огненное оружие',
		description: 'Удары с шансом поджечь цель.',
		mechanics: 'hit → шанс BURNING · (1 + ⌊L/6⌋) р.',
		exampleAtL: exampleAt('1 р.'),
		Icon: Flame,
		kind: 'buff',
	},
	MIND_WARD: {
		id: 'MIND_WARD',
		label: 'Вард разума',
		description: 'Защищает от контроля разума (помрачение и т.п.).',
		mechanics: 'блок mind-control · 2 р.',
		exampleAtL: exampleAt('2 р.'),
		Icon: Brain,
		kind: 'buff',
	},
	INVISIBLE: {
		id: 'INVISIBLE',
		label: 'Невидимость',
		description: 'Повышает уклонение; ближняя атака бьёт как дальняя.',
		mechanics: '+power уклонения · 2 р.',
		exampleAtL: exampleAt('+25 уклонения · 2 р.'),
		Icon: EyeOff,
		kind: 'buff',
	},
	INTERDICT: {
		id: 'INTERDICT',
		label: 'Запрет лечения',
		description: 'Цель временно не получает лечения.',
		mechanics: 'heal → 0 · (2 + ⌊L/4⌋) р.',
		exampleAtL: exampleAt('3 р.'),
		Icon: Ban,
		kind: 'debuff',
	},
	MAGIC_SHACKLES: {
		id: 'MAGIC_SHACKLES',
		label: 'Волшебные оковы',
		description: 'Трата маны обжигает носителя.',
		mechanics: 'spendMana → −cost×(10+⌊L/4⌋) ОЗ · (2 + ⌊L/6⌋) р.',
		exampleAtL: exampleAt('2 МР → −22 ОЗ · 2 р.'),
		Icon: Link,
		kind: 'debuff',
	},
	ENSLAVED: {
		id: 'ENSLAVED',
		label: 'Порабощённый',
		description: 'Временно сражается на стороне поработителя.',
		mechanics: 'смена команды · 1 р., затем возврат',
		exampleAtL: exampleAt('1 р.'),
		Icon: Hand,
		kind: 'debuff',
	},
	ROW_FORTIFY: {
		id: 'ROW_FORTIFY',
		label: 'Укрепление ряда',
		description: 'Пассивная броня отряда на ряду (рыцарь, злое дерево и т.п.).',
		mechanics: '+power брони · 1 р.',
		exampleAtL: exampleAt('+6 брони · 1 р.'),
		Icon: Shield,
		kind: 'buff',
	},
};

const FALLBACK: EffectMeta = {
	id: 'GUARDED',
	label: 'Неизвестный эффект',
	description: 'Описание пока недоступно.',
	mechanics: '—',
	exampleAtL: exampleAt('—'),
	Icon: HelpCircle,
	kind: 'buff',
};

export function getEffectMeta(id: string): EffectMeta {
	const known = CATALOG[id as EffectId];
	if (known) {
		return known;
	}
	return { ...FALLBACK, label: id || FALLBACK.label };
}

export function listEffectCatalog(): EffectMeta[] {
	return [...listBuffs(), ...listDebuffs()];
}

export function listBuffs(): EffectMeta[] {
	return BUFF_ORDER.map((id) => CATALOG[id]);
}

export function listDebuffs(): EffectMeta[] {
	return DEBUFF_ORDER.map((id) => CATALOG[id]);
}

export function formatEffectRounds(rounds: number): string | null {
	if (rounds <= 0) {
		return null;
	}
	return `Ещё ${rounds} р.`;
}
