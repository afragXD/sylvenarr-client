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
	Shuffle,
	Skull,
	Smile,
	Sparkles,
	Swords,
	Sword,
	ThumbsDown,
	Timer,
	VolumeX,
	WifiOff,
	Wind,
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
	| 'DEFEND'
	| 'POLYMORPH'
	| 'FIRESHIELD'
	| 'AIRSHIELD'
	| 'LUCKY'
	| 'FOCUSED'
	| 'STUNNED'
	| 'STUN_IMMUNE'
	| 'WEAKNESS'
	| 'UNLUCKY'
	| 'GALL'
	| 'SANCTUM'
	| 'FIREDWEAPON'
	| 'AIRWEAPON'
	| 'MIND_WARD'
	| 'INVISIBLE'
	| 'INTERDICT'
	| 'MAGIC_SHACKLES'
	| 'ENSLAVED'
	| 'ROW_FORTIFY'
	| 'ASHILLNESS'
	| 'ABSOLUTEPOWER'
	| 'BERSERK'
	| 'IMAGINARY_HEALTH'
	| 'IMMOLATION'
	| 'DEATHWARD';

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

/** Пример для формул, зависящих от L. */
const exampleAtL = (value: string): string => `Например при уровне ${CODEX_L}: ${value}`;

/** Пример для константных значений (без привязки к уровню). */
const exampleTypical = (value: string): string => `Типично: ${value}`;

const BUFF_ORDER: EffectId[] = [
	'GUARDED',
	'DEFEND',
	'STRENGTH',
	'BLESSED',
	'HAPPY',
	'VAMPWEAPON',
	'REGENHP',
	'HASTE',
	'CHAMELEON',
	'POLYMORPH',
	'FIRESHIELD',
	'AIRSHIELD',
	'STONEFLESH',
	'CONTR',
	'LUCKY',
	'FOCUSED',
	'SANCTUM',
	'FIREDWEAPON',
	'AIRWEAPON',
	'MIND_WARD',
	'INVISIBLE',
	'ROW_FORTIFY',
	'STUN_IMMUNE',
	'ABSOLUTEPOWER',
	'BERSERK',
	'IMAGINARY_HEALTH',
	'DEATHWARD',
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
	'ASHILLNESS',
	'IMMOLATION',
];

const CATALOG: Record<EffectId, EffectMeta> = {
	GUARDED: {
		id: 'GUARDED',
		label: 'Под охраной',
		description: 'Носителя нельзя выбрать целью обычных атак и большинства способностей.',
		mechanics: 'блок выбора цели · 1–2 р. (детектив и укус оборотня пробивают)',
		exampleAtL: exampleTypical('2 р. (рыцарь) / 1 р. (скелет-чемпион)'),
		Icon: Shield,
		kind: 'buff',
	},
	AIRSHIELD: {
		id: 'AIRSHIELD',
		label: 'Воздушный щит',
		description: 'Снижает урон от стрел и снарядов.',
		mechanics: '+33 сопротивления «Снаряды» · 2 р.',
		exampleAtL: exampleTypical('стрелы −33% · 2 р.'),
		Icon: Wind,
		kind: 'buff',
	},
	STRENGTH: {
		id: 'STRENGTH',
		label: 'Сила',
		description: 'Увеличивает наносимый урон.',
		mechanics: '+(20 + 2L) урона · (1 + ⌊L/5⌋) р.',
		exampleAtL: exampleAtL('+30 урона · 2 р.'),
		Icon: Sword,
		kind: 'buff',
	},
	BLESSED: {
		id: 'BLESSED',
		label: 'Благословение',
		description: 'Усиливает получаемое лечение.',
		mechanics: 'лечение ×(1 + power) · (1 + ⌊L/6⌋) р.',
		exampleAtL: exampleAtL('×1.5 лечения · 1 р.'),
		Icon: Sparkles,
		kind: 'buff',
	},
	POISON: {
		id: 'POISON',
		label: 'Отравление',
		description: 'Наносит урон смертью в начале хода носителя; сила эффекта — множитель.',
		mechanics: '(4–6 + раунды×6) × сила за ход',
		exampleAtL: exampleTypical('≈25 урона за ход при силе 1.5'),
		Icon: Droplet,
		kind: 'debuff',
	},
	BURNING: {
		id: 'BURNING',
		label: 'Поджог',
		description: 'Наносит урон огнём в начале хода носителя; сила эффекта — множитель.',
		mechanics: '(4–6 + 15) × сила за ход',
		exampleAtL: exampleTypical('≈26 урона за ход при силе 1.3'),
		Icon: Flame,
		kind: 'debuff',
	},
	BLEEDING: {
		id: 'BLEEDING',
		label: 'Кровотечение',
		description: 'Наносит урон смертью в начале хода носителя; сила эффекта — множитель.',
		mechanics: '(4 + раунды×3 + L) × сила за ход',
		exampleAtL: exampleTypical('≈20 урона за ход при силе 1.3'),
		Icon: Droplets,
		kind: 'debuff',
	},
	FATMAN: {
		id: 'FATMAN',
		label: 'Головокружение',
		description: 'Снижает уклонение.',
		mechanics: '−(15 + L) уклонения · 2 р.',
		exampleAtL: exampleAtL('−20 уклонения · 2 р.'),
		Icon: Orbit,
		kind: 'debuff',
	},
	HAPPY: {
		id: 'HAPPY',
		label: 'Радость',
		description: 'Повышает боевой дух.',
		mechanics: '+(15 + 2L) морали · 2 р.',
		exampleAtL: exampleAtL('+25 морали · 2 р.'),
		Icon: Smile,
		kind: 'buff',
	},
	CHAINED: {
		id: 'CHAINED',
		label: 'Обездвиженный',
		description: 'Сковывает цель, ограничивая манёвр.',
		mechanics: '2 р., без числового стата',
		exampleAtL: exampleTypical('2 р.'),
		Icon: Link,
		kind: 'debuff',
	},
	FEAR: {
		id: 'FEAR',
		label: 'Ужас',
		description: 'Штраф к урону от подавляющего страха.',
		mechanics: '−power к урону · 2 р. (снимается с откатом)',
		exampleAtL: exampleTypical('−3 урона · 2 р.'),
		Icon: Ghost,
		kind: 'debuff',
	},
	VAMPWEAPON: {
		id: 'VAMPWEAPON',
		label: 'Пьющий жизни',
		description: 'Оружие вампиризирует часть нанесённого урона.',
		mechanics: 'лечение ≈ power × урон · (1 + ⌊L/7⌋) р.',
		exampleAtL: exampleAtL('≈0.7 доли · 1 р.'),
		Icon: HeartPulse,
		kind: 'buff',
	},
	REGENHP: {
		id: 'REGENHP',
		label: 'Регенерация',
		description: 'Восстанавливает ОЗ в начале хода.',
		mechanics: 'лечение ≈ 6%×max ОЗ×power за ход',
		exampleAtL: exampleTypical('несколько ОЗ каждый ход'),
		Icon: Heart,
		kind: 'buff',
	},
	HASTE: {
		id: 'HASTE',
		label: 'Ускорение',
		description: 'Повышает инициативу.',
		mechanics: '+power к инициативе · 2 р.',
		exampleAtL: exampleTypical('+20 инициативы · 2 р.'),
		Icon: Zap,
		kind: 'buff',
	},
	CHAMELEON: {
		id: 'CHAMELEON',
		label: 'Хамелеон',
		description: 'Повышает уклонение.',
		mechanics: '+power к уклонению · 1 р.',
		exampleAtL: exampleTypical('+20 уклонения · 1 р.'),
		Icon: EyeOff,
		kind: 'buff',
	},
	PETRIFIED: {
		id: 'PETRIFIED',
		label: 'Окаменение',
		description: 'Каменная кожа: сильно повышает броню, часто со сковыванием.',
		mechanics: '+power брони · 2 р.',
		exampleAtL: exampleTypical('+15 брони · 2 р.'),
		Icon: Mountain,
		kind: 'debuff',
	},
	SLOW: {
		id: 'SLOW',
		label: 'Замедление',
		description: 'Снижает инициативу.',
		mechanics: '−power к инициативе · 2 р.',
		exampleAtL: exampleTypical('−20 инициативы · 2 р.'),
		Icon: Timer,
		kind: 'debuff',
	},
	STONEFLESH: {
		id: 'STONEFLESH',
		label: 'Каменная плоть',
		description: 'Временно усиливает броню союзника.',
		mechanics: '+power брони · (2 + ⌊L/4⌋) р.',
		exampleAtL: exampleAtL('+30 брони · 3 р.'),
		Icon: Mountain,
		kind: 'buff',
	},
	CONTR: {
		id: 'CONTR',
		label: 'Контрудар',
		description: 'Отвечает ближним ударом после получения урона.',
		mechanics: '1 контрудар ближним после попадания · 2+ р.',
		exampleAtL: exampleTypical('контрудар · 3 р.'),
		Icon: Swords,
		kind: 'buff',
	},
	MARKED: {
		id: 'MARKED',
		label: 'Метка',
		description: 'Цель помечена для добивания.',
		mechanics: 'метка без статов · (2 + ⌊L/6⌋) р.',
		exampleAtL: exampleAtL('2 р.'),
		Icon: Crosshair,
		kind: 'debuff',
	},
	DEATHSENTENCE: {
		id: 'DEATHSENTENCE',
		label: 'Смертный приговор',
		description: 'Ослабляет защиту (прокси резистов Разум/Смерть).',
		mechanics: '−power к броне · 2 р.',
		exampleAtL: exampleTypical('−8 брони · 2 р.'),
		Icon: Skull,
		kind: 'debuff',
	},
	INTERFERENCE: {
		id: 'INTERFERENCE',
		label: 'Помехи',
		description: 'Снижает силу магии.',
		mechanics: '−power к силе · (1 + ⌊L/6⌋) р.',
		exampleAtL: exampleAtL('−доля силы · 1 р.'),
		Icon: WifiOff,
		kind: 'debuff',
	},
	SILENCE: {
		id: 'SILENCE',
		label: 'Немота',
		description: 'Блокирует трату маны и магические способности.',
		mechanics: 'запрет траты маны · 2 р.',
		exampleAtL: exampleTypical('2 р.'),
		Icon: VolumeX,
		kind: 'debuff',
	},
	IMPISH: {
		id: 'IMPISH',
		label: 'Бес',
		description: 'Превращён в толстого беса: его абилки и облик; броня снята и вернётся.',
		mechanics: 'класс Imp, броня 0 · 2 р., затем откат класса',
		exampleAtL: exampleTypical('2 р.'),
		Icon: Bug,
		kind: 'debuff',
	},
	DEFEND: {
		id: 'DEFEND',
		label: 'Защитная стойка',
		description: '+50 к сопротивлению оружию и стихиям до конца стойки.',
		mechanics: '+50 WEAPON/FIRE/WATER/AIR/EARTH/DEATH/MIND · 1 р.',
		exampleAtL: exampleTypical('½ урона от оружия и стихий'),
		Icon: Shield,
		kind: 'buff',
	},
	POLYMORPH: {
		id: 'POLYMORPH',
		label: 'Многоликий',
		description: 'Ассасин в чужом облике; по окончании возвращается к себе.',
		mechanics: 'чужой класс · 2 р., затем откат',
		exampleAtL: exampleTypical('2 р.'),
		Icon: Shuffle,
		kind: 'buff',
	},
	FIRESHIELD: {
		id: 'FIRESHIELD',
		label: 'Огненный щит',
		description: 'Атакующий получает огненный урон и теряет броню; заряд щита тратится.',
		mechanics: 'ответный огонь ≈ 0.6×урон атакующего + ур. носителя · заряд/удар',
		exampleAtL: exampleTypical('обжиг + −броня за удар'),
		Icon: Flame,
		kind: 'buff',
	},
	LUCKY: {
		id: 'LUCKY',
		label: 'Удача',
		description: 'Повышает удачу (крит/шансы).',
		mechanics: '+power удачи · 2 р.',
		exampleAtL: exampleTypical('+20 удачи · 2 р.'),
		Icon: Clover,
		kind: 'buff',
	},
	FOCUSED: {
		id: 'FOCUSED',
		label: 'Сосредоточение',
		description: 'Повышает точность.',
		mechanics: '+power точности · 2 р.',
		exampleAtL: exampleTypical('+15 точности · 2 р.'),
		Icon: Focus,
		kind: 'buff',
	},
	STUNNED: {
		id: 'STUNNED',
		label: 'Оглушение',
		description: 'Пропускает следующий ход.',
		mechanics: 'пропуск хода · 1 р.',
		exampleAtL: exampleTypical('1 пропуск хода'),
		Icon: ZapOff,
		kind: 'debuff',
	},
	STUN_IMMUNE: {
		id: 'STUN_IMMUNE',
		label: 'Сопротивление оглушению',
		description: 'После пережитого оглушения цель нельзя оглушить повторно.',
		mechanics: '100% сопротивление оглушению · 2 р. после стана',
		exampleAtL: exampleTypical('2 р.'),
		Icon: Shield,
		kind: 'buff',
	},
	WEAKNESS: {
		id: 'WEAKNESS',
		label: 'Слабость',
		description: 'Снижает физический урон.',
		mechanics: '−power к урону · 2 р.',
		exampleAtL: exampleTypical('−30% урона · 2 р.'),
		Icon: ShieldOff,
		kind: 'debuff',
	},
	UNLUCKY: {
		id: 'UNLUCKY',
		label: 'Неудача',
		description: 'Снижает удачу и шанс крита.',
		mechanics: '−power к удаче · (1 + ⌊L/5⌋) р.',
		exampleAtL: exampleAtL('−20 удачи · 2 р.'),
		Icon: ThumbsDown,
		kind: 'debuff',
	},
	GALL: {
		id: 'GALL',
		label: 'Желчь',
		description: 'Урон водой каждый ход и разъедание брони.',
		mechanics: '20 × сила за ход + −броня · (2 + ⌊L/5⌋) р.',
		exampleAtL: exampleAtL('≈25 урона за ход · 3 р.'),
		Icon: Biohazard,
		kind: 'debuff',
	},
	SANCTUM: {
		id: 'SANCTUM',
		label: 'Святилище',
		description: 'Нельзя выбрать целью атаки и вражеских способностей.',
		mechanics: 'нельзя выбрать целью · (2 + ⌊L/5⌋) р.',
		exampleAtL: exampleAtL('3 р.'),
		Icon: Sparkles,
		kind: 'buff',
	},
	FIREDWEAPON: {
		id: 'FIREDWEAPON',
		label: 'Огненное оружие',
		description: 'Удары с шансом поджечь цель.',
		mechanics: 'удар → шанс «Поджог» · min(3, 1+⌊L/6⌋) р. (паладин: min(3, 2+⌊L/5⌋)).',
		exampleAtL: exampleAtL('1 р.'),
		Icon: Flame,
		kind: 'buff',
	},
	AIRWEAPON: {
		id: 'AIRWEAPON',
		label: 'Электрическое оружие',
		description: 'Удары наносят доп. урон воздухом и могут оглушить.',
		mechanics: 'доп. воздух ≈ сила/5+4; стан 50+⌊сила/5⌋% · 2 р.',
		exampleAtL: exampleTypical('искры + шанс стана'),
		Icon: Zap,
		kind: 'buff',
	},
	MIND_WARD: {
		id: 'MIND_WARD',
		label: 'Вард разума',
		description: 'Защищает от контроля разума (помрачение и т.п.).',
		mechanics: 'блок контроля разума · 2 р.',
		exampleAtL: exampleTypical('2 р.'),
		Icon: Brain,
		kind: 'buff',
	},
	INVISIBLE: {
		id: 'INVISIBLE',
		label: 'Невидимость',
		description: 'Повышает уклонение; ближняя атака бьёт как дальняя.',
		mechanics: '+power уклонения · 2 р.',
		exampleAtL: exampleTypical('+25 уклонения · 2 р.'),
		Icon: EyeOff,
		kind: 'buff',
	},
	INTERDICT: {
		id: 'INTERDICT',
		label: 'Запрет лечения',
		description: 'Цель временно не получает лечения.',
		mechanics: 'лечение → 0 · (2 + ⌊L/4⌋) р.',
		exampleAtL: exampleAtL('3 р.'),
		Icon: Ban,
		kind: 'debuff',
	},
	MAGIC_SHACKLES: {
		id: 'MAGIC_SHACKLES',
		label: 'Волшебные оковы',
		description: 'Трата маны обжигает носителя.',
		mechanics: 'трата маны → −стоимость×(10+⌊L/4⌋) ОЗ · (2 + ⌊L/6⌋) р.',
		exampleAtL: exampleAtL('2 МР → −22 ОЗ · 2 р.'),
		Icon: Link,
		kind: 'debuff',
	},
	ENSLAVED: {
		id: 'ENSLAVED',
		label: 'Порабощённый',
		description: 'Временно сражается на стороне поработителя.',
		mechanics: 'смена команды · 1 р., затем возврат',
		exampleAtL: exampleTypical('1 р.'),
		Icon: Hand,
		kind: 'debuff',
	},
	ROW_FORTIFY: {
		id: 'ROW_FORTIFY',
		label: 'Укрепление ряда',
		description: 'Пассивная броня отряда на ряду (рыцарь, злое дерево и т.п.).',
		mechanics: '+power брони · 1 р.',
		exampleAtL: exampleTypical('+6 брони · 1 р.'),
		Icon: Shield,
		kind: 'buff',
	},
	ASHILLNESS: {
		id: 'ASHILLNESS',
		label: 'Пепельная язва',
		description: 'Болезнь нежити: ослабляет магическую мощь и инициативу.',
		mechanics: '−25% мощи и инициативы при наложении · (1 + ⌊L/5⌋) р.',
		exampleAtL: exampleAtL('1 р. при L=5'),
		Icon: Biohazard,
		kind: 'debuff',
	},
	ABSOLUTEPOWER: {
		id: 'ABSOLUTEPOWER',
		label: 'Могущество',
		description: 'Временно усиливает силу магии союзника.',
		mechanics: '+(25% + 5%×L) силы магии · 1 р.',
		exampleAtL: exampleAtL('+50% силы магии · 1 р.'),
		Icon: Sparkles,
		kind: 'buff',
	},
	BERSERK: {
		id: 'BERSERK',
		label: 'Руна берсерка',
		description: 'Вся броня превращается в атаку; по окончании броня возвращается.',
		mechanics: 'броня → 0, атака + броня×(1 + L%) · 1 р.',
		exampleAtL: exampleAtL('30 брони → +32 атаки · 1 р.'),
		Icon: Swords,
		kind: 'buff',
	},
	IMAGINARY_HEALTH: {
		id: 'IMAGINARY_HEALTH',
		label: 'Мнимое здоровье',
		description: 'Добавляет здоровье сверх максимума; по окончании ровно столько же отнимает.',
		mechanics: '+(50 + 5×L) ОЗ сверх максимума · 2 р.',
		exampleAtL: exampleAtL('+75 ОЗ · 2 р.'),
		Icon: Heart,
		kind: 'buff',
	},
	DEATHWARD: {
		id: 'DEATHWARD',
		label: 'Оковы войны',
		description: 'Носитель переживает смертельный удар с 1 ОЗ.',
		mechanics: '+100% к «Смертельному удару» · 2 р.',
		exampleAtL: exampleTypical('+100% · 2 р.'),
		Icon: Link,
		kind: 'buff',
	},
	IMMOLATION: {
		id: 'IMMOLATION',
		label: 'Нечистый договор',
		description: 'Сила в долг: когда договор истекает, носитель теряет большую часть здоровья.',
		mechanics: 'по истечении −75% макс. ОЗ · 2 р. (рассеивание отменяет расплату)',
		exampleAtL: exampleTypical('−75% макс. ОЗ через 2 р.'),
		Icon: Flame,
		kind: 'debuff',
	},
};

const FALLBACK: EffectMeta = {
	id: 'GUARDED',
	label: 'Неизвестный эффект',
	description: 'Описание пока недоступно.',
	mechanics: '—',
	exampleAtL: exampleTypical('—'),
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
