import type { AbilityTag } from './abilityTags';

export type SlotExtra = {
	mechanics: string;
	tags: AbilityTag[];
};

export type PilotExtras = {
	passiveMechanics?: string;
	slots: Partial<Record<1 | 2 | 3 | 4 | 5, SlotExtra>>;
};

/** Формулы при L=5 (PILOT_LVL) + теги для всех пилотов. */
export const PILOT_EXTRAS: Record<string, PilotExtras> = {
	Knight: {
		passiveMechanics: 'В начале хода: ROW_FORTIFY +6 брони · 1 р. союзникам ряда.',
		slots: {
			1: { mechanics: 'Урон ×1.05; ~55% splash ×0.6 позади.', tags: ['attack'] },
			2: { mechanics: 'Удар сквозь ряд (ignore melee); нужен живой конь.', tags: ['attack'] },
			3: {
				mechanics: 'Стоимость 110 золота; STRENGTH/BLESSED ряду на 2 р.',
				tags: ['buff'],
			},
			4: { mechanics: 'GUARDED союзнику · 2 р., +3 брони.', tags: ['buff'] },
			5: {
				mechanics: 'Снимает POISON/BURNING/BLEEDING; шанс сохранить ход.',
				tags: ['heal'],
			},
		},
	},
	OrcKing: {
		passiveMechanics: 'Аура: при низкой удаче снимает удачу врагам в начале хода.',
		slots: {
			1: { mechanics: 'Урон ×1.1×ярость; игнор брони 25%.', tags: ['attack'] },
			2: { mechanics: 'Призыв гоблина (лимит саммонов).', tags: ['summon'] },
			3: { mechanics: 'Клич: HAPPY союзнику · 2 р.', tags: ['buff'] },
			4: { mechanics: 'Смена ряда / перестановка саммона.', tags: ['buff'] },
			5: { mechanics: 'FATMAN врагу · 2 р. (−уклонение).', tags: ['debuff'] },
		},
	},
	Archlich: {
		slots: {
			1: { mechanics: 'Магия ×1.1 + splash; игнор брони 15%.', tags: ['attack', 'aoe'] },
			2: { mechanics: 'Призыв/эволюция нежити (меню).', tags: ['summon'] },
			3: { mechanics: 'Лечение/вампир по выбору.', tags: ['heal'] },
			4: { mechanics: 'FEAR ряду / цели.', tags: ['debuff', 'aoe'] },
			5: { mechanics: 'Жертва союзника → мана + усиление.', tags: ['buff'] },
		},
	},
	DemonLord: {
		slots: {
			1: { mechanics: 'Урон всем в ряду цели; kill → heal.', tags: ['attack', 'aoe'] },
			2: { mechanics: 'Урон ×2; шанс PETRIFIED+CHAINED.', tags: ['attack', 'debuff'] },
			3: { mechanics: 'Магия; шанс сильного −брони.', tags: ['attack', 'debuff'] },
			4: {
				mechanics: 'На себя GUARDED («Под охраной»); союзнику REGENHP. Не FIREDWEAPON.',
				tags: ['buff', 'heal'],
			},
			5: {
				mechanics: 'Ульта: урон всем врагам + shuffle рядов (заряды).',
				tags: ['attack', 'aoe'],
			},
		},
	},
	Assassin: {
		slots: {
			1: { mechanics: 'Урон ×1.15; игнор брони 35%.', tags: ['attack'] },
			2: { mechanics: 'Дротик → POISON (заряды).', tags: ['debuff'] },
			3: { mechanics: 'Death Note %: шанс мгновенной смерти.', tags: ['attack'] },
			4: { mechanics: 'Копирует класс убитой цели.', tags: ['buff'] },
			5: { mechanics: 'CHAMELEON · +dodge.', tags: ['buff'] },
		},
	},
	Paladin: {
		slots: {
			1: { mechanics: 'Удар ×1.05; двойной удар ~35%.', tags: ['attack'] },
			2: { mechanics: 'Ульта: FIREDWEAPON союзнику (заряды).', tags: ['buff'] },
			3: { mechanics: 'Лечение союзника.', tags: ['heal'] },
			4: { mechanics: 'BLESSED союзнику.', tags: ['buff'] },
			5: { mechanics: 'Рывок на фронт; ×1.25 vs нежить.', tags: ['attack'] },
		},
	},
	Abbess: {
		slots: {
			1: { mechanics: 'Магия; шанс forbiddenResurrect.', tags: ['attack'] },
			2: { mechanics: 'Лечение союзника.', tags: ['heal'] },
			3: { mechanics: 'STONEFLESH союзнику.', tags: ['buff'] },
			4: { mechanics: 'Cleanse дебаффов ряду.', tags: ['heal', 'aoe'] },
			5: { mechanics: 'Защита: пассивно LUCKY при defend.', tags: ['buff'] },
		},
	},
	Witch: {
		slots: {
			1: { mechanics: 'Выстрел (патроны gun).', tags: ['attack'] },
			2: { mechanics: 'SLOW / контроль.', tags: ['debuff'] },
			3: { mechanics: 'IMPISH полиморф.', tags: ['debuff'] },
			4: { mechanics: 'Бафф/проклятие по выбору.', tags: ['buff', 'debuff'] },
			5: { mechanics: 'Перезарядка / особый выстрел.', tags: ['attack'] },
		},
	},
	Inquisitor: {
		slots: {
			1: { mechanics: 'Удар; CONTRI при защите.', tags: ['attack'] },
			2: { mechanics: 'Кара ×1.25.', tags: ['attack'] },
			3: { mechanics: 'Телекинез: смена ряда цели.', tags: ['debuff'] },
			4: { mechanics: 'INTERFERENCE / контроль разума.', tags: ['debuff'] },
			5: { mechanics: 'SILENCE / доп. давление.', tags: ['debuff'] },
		},
	},
	Marauder: {
		slots: {
			1: { mechanics: 'Выстрел; сильнее vs MARKED.', tags: ['attack'] },
			2: { mechanics: 'Метка / прицел.', tags: ['debuff'] },
			3: { mechanics: 'Смена ряда.', tags: ['buff'] },
			4: { mechanics: 'Оборотень (ульта → Werewolf).', tags: ['buff'] },
			5: { mechanics: 'Доп. выстрел / добивание.', tags: ['attack'] },
		},
	},
	Werewolf: {
		slots: {
			1: { mechanics: 'Ближний удар; вампиризм ~20%.', tags: ['attack', 'heal'] },
			2: { mechanics: 'Ярость / усиление.', tags: ['buff'] },
			3: { mechanics: 'AoE укус.', tags: ['attack', 'aoe'] },
			4: { mechanics: 'Возврат в Мародёра.', tags: ['buff'] },
			5: { mechanics: 'Доп. атака.', tags: ['attack'] },
		},
	},
	Herbalist: {
		slots: {
			1: { mechanics: 'Слабый удар / поддержка.', tags: ['attack'] },
			2: { mechanics: 'Лечение союзника.', tags: ['heal'] },
			3: { mechanics: 'Снятие POISON и дебаффов.', tags: ['heal'] },
			4: { mechanics: 'REGENHP / бафф.', tags: ['buff', 'heal'] },
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Patriarch: {
		slots: {
			1: { mechanics: '2 МР: урон колонне.', tags: ['attack', 'aoe'] },
			2: { mechanics: '3 МР: heal ≈ L×7 + power/3.', tags: ['heal'] },
			3: { mechanics: '5 МР: воскрешение с кладбища.', tags: ['heal', 'summon'] },
			4: { mechanics: 'SANCTUM союзнику (ульта).', tags: ['buff'] },
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Oracle: {
		slots: {
			1: { mechanics: '2 МР: heal + рост maxHp.', tags: ['heal'] },
			2: { mechanics: '3 МР: доп. ход союзнику (уже ходившему).', tags: ['buff'] },
			3: { mechanics: 'MIND_WARD + HAPPY цели.', tags: ['buff'] },
			4: { mechanics: 'Ульта: мана ряду.', tags: ['buff', 'aoe'] },
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Demiurge: {
		slots: {
			1: { mechanics: 'Цепная магия по нескольким врагам.', tags: ['attack', 'aoe'] },
			2: { mechanics: 'Фантом-копия (саммон).', tags: ['summon'] },
			3: { mechanics: 'Бафф/щит союзнику.', tags: ['buff'] },
			4: { mechanics: 'Контроль / дебафф.', tags: ['debuff'] },
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Pyro: {
		slots: {
			1: { mechanics: 'Огнемёт: 2 случайные цели.', tags: ['attack', 'aoe'] },
			2: { mechanics: 'Сильнее vs BURNING.', tags: ['attack'] },
			3: { mechanics: 'FIREDWEAPON союзнику.', tags: ['buff'] },
			4: { mechanics: 'Самосожжение / уход.', tags: ['attack', 'aoe'] },
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Specter: {
		slots: {
			1: { mechanics: 'Mind-удар + выбор второй цели STUN.', tags: ['attack', 'debuff'] },
			2: { mechanics: 'Ритуал / метка.', tags: ['debuff'] },
			3: { mechanics: 'BLEEDING / контроль.', tags: ['debuff'] },
			4: { mechanics: 'Доп. давление.', tags: ['attack'] },
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Detective: {
		slots: {
			1: { mechanics: 'Рапира; под INVISIBLE бьёт как ranged.', tags: ['attack'] },
			2: { mechanics: 'Яд случайному врагу (ульта).', tags: ['debuff'] },
			3: { mechanics: 'INVISIBLE на себя (ульта).', tags: ['buff'] },
			4: { mechanics: 'Выпад с заднего ряда + смена ряда.', tags: ['attack'] },
			5: { mechanics: 'Выстрел / перезарядка с фронта.', tags: ['attack'] },
		},
	},
	GhostWarrior: {
		slots: {
			1: {
				mechanics: 'Урон ×(1+0.15×могилы); шанс STUN 65+L%.',
				tags: ['attack', 'debuff'],
			},
			2: { mechanics: 'VAMPWEAPON на удары.', tags: ['buff', 'heal'] },
			3: { mechanics: 'STRENGTH своему ряду.', tags: ['buff', 'aoe'] },
			4: { mechanics: 'Ульта: +maxHp и heal себя.', tags: ['heal'] },
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	GoldGolem: {
		passiveMechanics: '50%: MIND_WARD случайному союзнику ≠ себя в начале хода.',
		slots: {
			1: { mechanics: '×0.9, игнор 20%; шанс STUN 20+L%.', tags: ['attack', 'debuff'] },
			2: {
				mechanics: '70%: −2–3 МР + INTERFERENCE; иначе HAPPY цели.',
				tags: ['debuff', 'buff'],
			},
			3: { mechanics: 'STONEFLESH союзнику · 2+⌊L/4⌋ р.', tags: ['buff'] },
			4: { mechanics: '+power союзникам (доля 0.25+0.05L).', tags: ['buff', 'aoe'] },
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	BeerElemental: {
		passiveMechanics: 'В начале хода: −10…80 золота.',
		slots: {
			1: {
				mechanics: 'HAPPY: +10+2L удачи если luck<5, иначе +5 · 2 р.',
				tags: ['buff'],
			},
			2: { mechanics: '70+2L%: FATMAN · 2 р.', tags: ['debuff'] },
			3: { mechanics: 'critBank += 1+⌊L/5⌋ союзнику.', tags: ['buff'] },
			4: { mechanics: 'POISON · 2 р.; −1 заряд торпеды.', tags: ['debuff'] },
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	EvilTree: {
		passiveMechanics: 'В начале хода: ROW_FORTIFY +2+⌊L/5⌋ брони ряду · 1 р.',
		slots: {
			1: {
				mechanics: 'FOCUSED + LUCKY союзнику (длительность от L).',
				tags: ['buff'],
			},
			2: {
				mechanics: 'Урон врагу; heal ряду = урон / N союзников ряда.',
				tags: ['attack', 'heal', 'aoe'],
			},
			3: { mechanics: 'INTERDICT · 2+⌊L/4⌋ р. (heal→0).', tags: ['debuff'] },
			4: {
				mechanics: '3 МР: случайный STRENGTH / HAPPY / HASTE · 2 р.',
				tags: ['buff'],
			},
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Mermaid: {
		slots: {
			1: {
				mechanics: 'Heal L×5+round(20×(2−hp/max)); +accuracy L×2+2 навсегда.',
				tags: ['heal', 'buff'],
			},
			2: { mechanics: 'Ряд цели: STUN 38+L% каждому.', tags: ['debuff', 'aoe'] },
			3: {
				mechanics: 'REGENHP союзнику; ENSLAVED врагу 1 р. (нежить/механизм — нет).',
				tags: ['heal', 'debuff'],
			},
			4: {
				mechanics: '2 МР: MAGIC_SHACKLES · 2+⌊L/6⌋ р. (жжёт при spendMana).',
				tags: ['debuff'],
			},
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Dracolich: {
		passiveMechanics: 'В начале хода: heal maxHp/6.',
		slots: {
			1: {
				mechanics: 'Магия всем врагам ×(1+(1−hp%)×0.36); POISON 70+L%.',
				tags: ['attack', 'aoe', 'debuff'],
			},
			2: {
				mechanics: 'Shuffle колонн; ряду: UNLUCKY + 85% WEAKNESS.',
				tags: ['debuff', 'aoe'],
			},
			3: { mechanics: 'Если hp < 20% max — мгновенная смерть.', tags: ['attack'] },
			4: {
				mechanics: 'Воскрешение нежити с кладбища; 80% forbiddenResurrect.',
				tags: ['summon', 'heal'],
			},
			5: {
				mechanics: 'Хвост: armorIgnore 0.75 если MARKED, иначе 0.',
				tags: ['attack'],
			},
		},
	},
};
