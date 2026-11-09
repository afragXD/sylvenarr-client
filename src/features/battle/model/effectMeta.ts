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
	Sword,
	Swords,
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
	| 'INFECTED'
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
	| 'LOVE_SHACKLES'
	| 'ENSLAVED'
	| 'ROW_FORTIFY'
	| 'ASHILLNESS'
	| 'ABSOLUTEPOWER'
	| 'BERSERK'
	| 'IMAGINARY_HEALTH'
	| 'IMMOLATION'
	| 'DEATHWARD'
	| 'PAIN_REFLECT'
	| 'LIFE_FETTERS'
	| 'LIFE_THREAD'
	| 'ERUPTION'
	| 'REFLECTION'
	| 'REGENMANA'
	| 'KILLMANA'
	| 'DRUNK'
	| 'POISONEDWEAPON'
	| 'BREAKWEAPON';

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
	'LOVE_SHACKLES',
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
	'PAIN_REFLECT',
	'LIFE_THREAD',
	'REFLECTION',
	'REGENMANA',
	'POISONEDWEAPON',
	'BREAKWEAPON',
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
	'INFECTED',
	'STUNNED',
	'WEAKNESS',
	'UNLUCKY',
	'GALL',
	'INTERDICT',
	'MAGIC_SHACKLES',
	'ENSLAVED',
	'ASHILLNESS',
	'IMMOLATION',
	'LIFE_FETTERS',
	'ERUPTION',
	'KILLMANA',
	'DRUNK',
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
		description: 'Увеличивает наносимый урон (величина и длительность зависят от источника).',
		mechanics: '+power к урону · N р. (напр. баллада +(15+L) · 1+⌊L/5⌋ р.)',
		exampleAtL: exampleAtL('баллада L5: +20 урона · 2 р.'),
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
		description: 'Каждый ход носитель теряет боевой дух (сила эффекта × резист Разума).',
		mechanics: '−мораль каждый ход · 2 р.',
		exampleAtL: exampleTypical('потеря морали каждый ход · 2 р.'),
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
		description:
			'Сразу снижает броню цели на величину силы эффекта; пока висит — броня остаётся пониженной. По окончании (или при снятии) броня возвращается на ту же величину.',
		mechanics: '−power брони наложить; +power брони при спадении · 2 р.',
		exampleAtL: exampleTypical('−8 брони · 2 р., затем возврат'),
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
		mechanics: 'класс Imp, броня 0 · 1 р., затем откат класса',
		exampleAtL: exampleTypical('1 р.'),
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
	INFECTED: {
		id: 'INFECTED',
		label: 'Инфицирован',
		description: 'Временно стал зомби; по окончании возвращается к исходному облику.',
		mechanics: 'класс Зомби · 2 р., затем откат',
		exampleAtL: exampleTypical('2 р.'),
		Icon: Shuffle,
		kind: 'debuff',
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
		label: 'Изменение точности',
		description: 'Меняет точность носителя на величину силы (знак силы задаёт направление).',
		mechanics: '±power точности · обычно 1–2 р.',
		exampleAtL: exampleTypical('+15 или −17 точности · 2 р.'),
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
		description:
			'Сила эффекта — шанс пережить оглушение. Мыло слоад и военная молитва дают 50%. После пережитого оглушения сила становится 100%.',
		mechanics: 'шанс power% (мыло и молитва — 50%; после стана — 100%)',
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
		description:
			'Каждый ход наносит урон водой и навсегда разъедает броню; после конца эффекта броня не возвращается.',
		mechanics: '(10 + L) Вода/тик + −(3 + ⌊L/5⌋) брони/тик · (2 + ⌊L/8⌋) р.',
		exampleAtL: exampleAtL('20 Вода и −4 брони за тик · 3 р.'),
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
		mechanics: 'доп. воздух round(сила/5+4)+⌊L оракула/3⌋; стан 50+⌊сила/5⌋% · 2 р.',
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
		description:
			'Нельзя выбрать целью. Своя атака ещё бьёт издалека, затем невидимость спадает. Защита и ожидание её не снимают.',
		mechanics: 'нельзя выбрать · спадает после своего действия',
		exampleAtL: exampleTypical('2 р. или до своего действия'),
		Icon: EyeOff,
		kind: 'buff',
	},
	INTERDICT: {
		id: 'INTERDICT',
		label: 'Запрет лечения',
		description: 'Цель временно не получает лечения.',
		mechanics: 'лечение → 0 · 2 р.',
		exampleAtL: exampleTypical('2 р.'),
		Icon: Ban,
		kind: 'debuff',
	},
	LOVE_SHACKLES: {
		id: 'LOVE_SHACKLES',
		label: 'Оковы любви',
		description:
			'Реальное лечение одного конца копируется партнёру один раз и не уходит дальше. Смерть любого конца рвёт связь.',
		mechanics: 'копия фактического прироста ОЗ · 3+⌊L/7⌋ р.',
		exampleAtL: exampleAtL('4 р.; +12 ОЗ партнёру, если сам получил +12'),
		Icon: Heart,
		kind: 'buff',
	},
	MAGIC_SHACKLES: {
		id: 'MAGIC_SHACKLES',
		label: 'Волшебные оковы',
		description: 'Трата маны обжигает носителя жизнью через резисты. Уровень Полуденницы записан в эффекте.',
		mechanics: 'трата X МР → X×(5+⌊L Полуденницы/4⌋) Жизнь · (2+⌊L/6⌋) р.',
		exampleAtL: exampleAtL('2 МР при L1 → 10 Жизнь'),
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
	PAIN_REFLECT: {
		id: 'PAIN_REFLECT',
		label: 'Отражение боли',
		description: 'При ближнем ударе возвращает атакующему половину фактически нанесённого урона.',
		mechanics: 'melee → 50% урона обратно (без цепочек отражения) · 2 р.',
		exampleAtL: exampleTypical('50% отражения · 2 р.'),
		Icon: Swords,
		kind: 'buff',
	},
	LIFE_FETTERS: {
		id: 'LIFE_FETTERS',
		label: 'Оковы взаимного терпения',
		description:
			'Связь с Воином-призраком: 100% полученного им урона переносится на носителя источником Жизнь (без резистов и без Отражения боли).',
		mechanics: 'перенос урона с носителя связи · 3 р.',
		exampleAtL: exampleTypical('3 р.'),
		Icon: Link,
		kind: 'debuff',
	},
	LIFE_THREAD: {
		id: 'LIFE_THREAD',
		label: 'Жизнь на нитке',
		description: 'Урон растёт от потерянного здоровья: +1% урона за 1% потерянных ОЗ (кап +75%).',
		mechanics: '+min(75%, % потерянных ОЗ) к урону атак · (2+⌊L/7⌋) р.',
		exampleAtL: exampleAtL('при L5 · 2 р.; на 50% ОЗ → +50% урона'),
		Icon: HeartPulse,
		kind: 'buff',
	},
	ERUPTION: {
		id: 'ERUPTION',
		label: 'Извержение',
		description:
			'При смерти носителя союзники получают огненный урон: ¼ max ОЗ своему ряду и половину того — другому; пока висит — сопротивление Огню уже снижено.',
		mechanics: 'при смерти: FIRE ¼ maxОЗ ряду / ½ тому другому ряду · (2+⌊L/8⌋) р.',
		exampleAtL: exampleAtL('L5 → 2 р.; смерть при 200 max → 50/25 Огнём'),
		Icon: Flame,
		kind: 'debuff',
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
	REFLECTION: {
		id: 'REFLECTION',
		label: 'Отражение',
		description: 'Дебафф, наложенный на носителя, уходит случайному врагу без Отражения.',
		mechanics: 'перенаправление дебаффов · по длительности эффекта',
		exampleAtL: exampleTypical('дебафф уходит случайному врагу без Отражения'),
		Icon: Shuffle,
		kind: 'buff',
	},
	REGENMANA: {
		id: 'REGENMANA',
		label: 'Источник маны',
		description: 'В начале хода восстанавливает ману.',
		mechanics: '+сила эффекта к мане в начале хода',
		exampleAtL: exampleTypical('+10 маны за ход при силе 10'),
		Icon: Droplet,
		kind: 'buff',
	},
	KILLMANA: {
		id: 'KILLMANA',
		label: 'Высасывание',
		description: 'В начале хода отнимает ману.',
		mechanics: '−сила эффекта к мане в начале хода',
		exampleAtL: exampleTypical('−10 маны за ход при силе 10'),
		Icon: Droplets,
		kind: 'debuff',
	},
	DRUNK: {
		id: 'DRUNK',
		label: 'Опьянение',
		description: 'Снижает точность на время эффекта; при снятии откатывается.',
		mechanics: '−сила эффекта к точности на время эффекта',
		exampleAtL: exampleTypical('−10 точности при силе 10'),
		Icon: Smile,
		kind: 'debuff',
	},
	POISONEDWEAPON: {
		id: 'POISONEDWEAPON',
		label: 'Отравленный клинок',
		description: 'После попадания в ближнем бою отравляет цель.',
		mechanics: 'попадание в ближнем бою: Яд на 1–2 р., сила 1,2',
		exampleAtL: exampleTypical('яд 1–2 р. после удара'),
		Icon: Biohazard,
		kind: 'buff',
	},
	BREAKWEAPON: {
		id: 'BREAKWEAPON',
		label: 'Рунический клинок',
		description: 'После попадания в ближнем бою разрушает броню цели.',
		mechanics: 'попадание в ближнем бою: −(10 + уровень атакующего) брони цели',
		exampleAtL: exampleAtL('−(10+5) брони после удара'),
		Icon: ShieldOff,
		kind: 'buff',
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

/**
 * Мета эффекта. Знак силы для двухсторонних эффектов:
 * FOCUSED (CUT AC-12): + точность / − точность;
 * STRENGTH / ABSOLUTEPOWER (мораль): + бафф / − дебафф (упадок духа).
 */
export function getEffectMeta(id: string, power?: number): EffectMeta {
	const known = CATALOG[id as EffectId];
	if (!known) {
		return { ...FALLBACK, label: id || FALLBACK.label };
	}
	if (typeof power !== 'number') {
		return known;
	}
	if (id === 'FOCUSED') {
		if (power > 0) {
			return {
				...known,
				label: 'Повышение точности',
				description: 'Повышает точность носителя.',
				mechanics: `+${Math.round(power)} точности`,
				kind: 'buff',
			};
		}
		if (power < 0) {
			return {
				...known,
				label: 'Снижение точности',
				description: 'Снижает точность носителя.',
				mechanics: `${Math.round(power)} точности`,
				kind: 'debuff',
			};
		}
	}
	if (id === 'STRENGTH' && power < 0) {
		return {
			...known,
			label: 'Ослабление атаки',
			description: 'Снижает наносимый урон (упадок духа или иной источник).',
			mechanics: `${Math.round(power)} к урону`,
			kind: 'debuff',
		};
	}
	if (id === 'ABSOLUTEPOWER' && power < 0) {
		return {
			...known,
			label: 'Ослабление магии',
			description: 'Снижает силу магии носителя (упадок духа или иной источник).',
			mechanics: `${Math.round(power)} к силе магии`,
			kind: 'debuff',
		};
	}
	return known;
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
