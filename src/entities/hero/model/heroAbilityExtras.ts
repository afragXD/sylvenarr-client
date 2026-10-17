import type { AbilityTag } from './abilityTags';

export type SlotExtra = {
	mechanics: string;
	tags: AbilityTag[];
};

export type PilotExtras = {
	passiveMechanics?: string;
	slots: Partial<Record<1 | 2 | 3 | 4 | 5, SlotExtra>>;
};

/** Формулы при L=5 (PILOT_LVL) + теги; названия эффектов — как в кодексе. */
export const PILOT_EXTRAS: Record<string, PilotExtras> = {
	Knight: {
		passiveMechanics:
			'В начале хода: «Укрепление ряда» +6 брони · 1 р. союзникам ряда.',
		slots: {
			1: {
				mechanics: 'Урон ×1.05; ~55% задеть врага позади ×0.6.',
				tags: ['attack'],
			},
			2: { mechanics: 'Удар сквозь ряд; нужен живой конь.', tags: ['attack'] },
			3: {
				mechanics: 'Стоимость 110 золота; «Сила» / «Благословение» ряду на 2 р.',
				tags: ['buff'],
			},
			4: { mechanics: '«Под охраной» союзнику · 2 р., +3 брони.', tags: ['buff'] },
			5: {
				mechanics:
					'Снимает «Отравление» / «Поджог» / «Кровотечение»; шанс сохранить ход.',
				tags: ['heal'],
			},
		},
	},
	OrcKing: {
		passiveMechanics: 'Аура: при низкой удаче снимает удачу врагам в начале хода.',
		slots: {
			1: { mechanics: 'Урон ×1.1×ярость; игнор брони 25%.', tags: ['attack'] },
			2: { mechanics: 'Призыв гоблина (лимит саммонов).', tags: ['summon'] },
			3: { mechanics: 'Клич: «Радость» союзнику · 2 р.', tags: ['buff'] },
			4: { mechanics: 'Смена ряда / перестановка саммона.', tags: ['buff'] },
			5: {
				mechanics: '«Головокружение» врагу · 2 р. (−уклонение).',
				tags: ['debuff'],
			},
		},
	},
	Archlich: {
		slots: {
			1: {
				mechanics: 'Магия ×1.1 + урон по соседней цели; игнор брони 15%.',
				tags: ['attack', 'aoe'],
			},
			2: { mechanics: 'Призыв/эволюция нежити (меню).', tags: ['summon'] },
			3: { mechanics: 'Лечение/вампир по выбору.', tags: ['heal'] },
			4: { mechanics: '«Ужас» ряду / цели.', tags: ['debuff', 'aoe'] },
			5: { mechanics: 'Жертва союзника → мана + усиление.', tags: ['buff'] },
		},
	},
	DemonLord: {
		slots: {
			1: { mechanics: 'Урон всем в ряду цели; убийство → лечение.', tags: ['attack', 'aoe'] },
			2: {
				mechanics: 'Урон ×2; шанс «Окаменение» + «Обездвиженный».',
				tags: ['attack', 'debuff'],
			},
			3: { mechanics: 'Магия; шанс сильного −брони.', tags: ['attack', 'debuff'] },
			4: {
				mechanics:
					'На себя «Под охраной»; союзнику «Регенерация». Не путать с «Огненным оружием».',
				tags: ['buff', 'heal'],
			},
			5: {
				mechanics: 'Ульта: урон всем врагам + перемешивание рядов (заряды).',
				tags: ['attack', 'aoe'],
			},
		},
	},
	Assassin: {
		slots: {
			1: { mechanics: 'Урон ×1.15; игнор брони 35%.', tags: ['attack'] },
			2: { mechanics: 'Дротик → «Отравление» (заряды).', tags: ['debuff'] },
			3: {
				mechanics: 'Тетрадь смерти: шанс мгновенной смерти (%).',
				tags: ['attack'],
			},
			4: { mechanics: 'Копирует класс убитой цели.', tags: ['buff'] },
			5: { mechanics: '«Хамелеон» · +уклонение.', tags: ['buff'] },
		},
	},
	Paladin: {
		slots: {
			1: { mechanics: 'Удар ×1.05; двойной удар ~35%.', tags: ['attack'] },
			2: {
				mechanics: 'Ульта: «Огненное оружие» союзнику (заряды).',
				tags: ['buff'],
			},
			3: { mechanics: 'Лечение союзника.', tags: ['heal'] },
			4: { mechanics: '«Благословение» союзнику.', tags: ['buff'] },
			5: { mechanics: 'Рывок на фронт; ×1.25 против нежити.', tags: ['attack'] },
		},
	},
	Abbess: {
		slots: {
			1: { mechanics: 'Магия; шанс запрета воскрешения.', tags: ['attack'] },
			2: { mechanics: 'Лечение союзника.', tags: ['heal'] },
			3: { mechanics: '«Каменная плоть» союзнику.', tags: ['buff'] },
			4: { mechanics: 'Снятие ослаблений с ряда.', tags: ['heal', 'aoe'] },
			5: {
				mechanics: 'Защита: пассивно «Удача» при кнопке «Защита».',
				tags: ['buff'],
			},
		},
	},
	Witch: {
		slots: {
			1: { mechanics: 'Выстрел (патроны).', tags: ['attack'] },
			2: { mechanics: '«Замедление» / контроль.', tags: ['debuff'] },
			3: { mechanics: '«Бес» — полиморф.', tags: ['debuff'] },
			4: { mechanics: 'Бафф или проклятие по выбору.', tags: ['buff', 'debuff'] },
			5: { mechanics: 'Перезарядка / особый выстрел.', tags: ['attack'] },
		},
	},
	Inquisitor: {
		slots: {
			1: {
				mechanics: 'Удар; при защите получает «Контрудар».',
				tags: ['attack'],
			},
			2: { mechanics: 'Кара ×1.25.', tags: ['attack'] },
			3: { mechanics: 'Телекинез: смена ряда цели.', tags: ['debuff'] },
			4: { mechanics: '«Помехи» / контроль разума.', tags: ['debuff'] },
			5: { mechanics: '«Немота» / доп. давление.', tags: ['debuff'] },
		},
	},
	Marauder: {
		slots: {
			1: {
				mechanics: 'Выстрел; сильнее против цели с «Меткой».',
				tags: ['attack'],
			},
			2: { mechanics: 'Метка / прицел.', tags: ['debuff'] },
			3: { mechanics: 'Смена ряда.', tags: ['buff'] },
			4: { mechanics: 'Оборотень (ульта → Волк).', tags: ['buff'] },
			5: { mechanics: 'Доп. выстрел / добивание.', tags: ['attack'] },
		},
	},
	Werewolf: {
		slots: {
			1: { mechanics: 'Ближний удар; вампиризм ~20%.', tags: ['attack', 'heal'] },
			2: { mechanics: 'Ярость / усиление.', tags: ['buff'] },
			3: { mechanics: 'Удар по площади.', tags: ['attack', 'aoe'] },
			4: { mechanics: 'Возврат в Мародёра.', tags: ['buff'] },
			5: { mechanics: 'Доп. атака.', tags: ['attack'] },
		},
	},
	Herbalist: {
		slots: {
			1: { mechanics: 'Слабый удар / поддержка.', tags: ['attack'] },
			2: { mechanics: 'Лечение союзника.', tags: ['heal'] },
			3: {
				mechanics: 'Снятие «Отравления» и других ослаблений.',
				tags: ['heal'],
			},
			4: { mechanics: '«Регенерация» / бафф.', tags: ['buff', 'heal'] },
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Patriarch: {
		slots: {
			1: { mechanics: '2 МР: урон колонне.', tags: ['attack', 'aoe'] },
			2: { mechanics: '3 МР: лечение ≈ L×7 + сила/3.', tags: ['heal'] },
			3: { mechanics: '5 МР: воскрешение с кладбища.', tags: ['heal', 'summon'] },
			4: { mechanics: '«Святилище» союзнику (ульта).', tags: ['buff'] },
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Oracle: {
		slots: {
			1: { mechanics: '2 МР: лечение + рост max ОЗ.', tags: ['heal'] },
			2: {
				mechanics: '3 МР: доп. ход союзнику (уже ходившему).',
				tags: ['buff'],
			},
			3: {
				mechanics: '«Вард разума» + «Радость» цели.',
				tags: ['buff'],
			},
			4: { mechanics: 'Ульта: мана ряду.', tags: ['buff', 'aoe'] },
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Demiurge: {
		slots: {
			1: {
				mechanics: 'Цепная магия по нескольким врагам.',
				tags: ['attack', 'aoe'],
			},
			2: { mechanics: 'Фантом-копия (саммон).', tags: ['summon'] },
			3: { mechanics: 'Бафф/щит союзнику.', tags: ['buff'] },
			4: { mechanics: 'Контроль / дебафф.', tags: ['debuff'] },
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Pyro: {
		slots: {
			1: { mechanics: 'Огнемёт: 2 случайные цели.', tags: ['attack', 'aoe'] },
			2: {
				mechanics: 'Сильнее против цели с «Поджогом».',
				tags: ['attack'],
			},
			3: { mechanics: '«Огненное оружие» союзнику.', tags: ['buff'] },
			4: { mechanics: 'Самосожжение / уход.', tags: ['attack', 'aoe'] },
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Specter: {
		slots: {
			1: {
				mechanics: 'Удар разума + выбор второй цели «Оглушение».',
				tags: ['attack', 'debuff'],
			},
			2: { mechanics: 'Ритуал / метка.', tags: ['debuff'] },
			3: { mechanics: '«Кровотечение» / контроль.', tags: ['debuff'] },
			4: { mechanics: 'Доп. давление.', tags: ['attack'] },
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Detective: {
		slots: {
			1: {
				mechanics: 'Рапира; под «Невидимостью» бьёт как дальник.',
				tags: ['attack'],
			},
			2: { mechanics: 'Яд случайному врагу (ульта).', tags: ['debuff'] },
			3: { mechanics: '«Невидимость» на себя (ульта).', tags: ['buff'] },
			4: { mechanics: 'Выпад с заднего ряда + смена ряда.', tags: ['attack'] },
			5: { mechanics: 'Выстрел / перезарядка с фронта.', tags: ['attack'] },
		},
	},
	GhostWarrior: {
		slots: {
			1: {
				mechanics: 'Урон ×(1+0.15×могилы); шанс «Оглушение» 65+L%.',
				tags: ['attack', 'debuff'],
			},
			2: { mechanics: '«Пьющий жизни» на удары.', tags: ['buff', 'heal'] },
			3: { mechanics: '«Сила» своему ряду.', tags: ['buff', 'aoe'] },
			4: { mechanics: 'Ульта: +max ОЗ и лечение себя.', tags: ['heal'] },
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	GoldGolem: {
		passiveMechanics:
			'50%: «Вард разума» случайному союзнику (не себе) в начале хода.',
		slots: {
			1: {
				mechanics: '×0.9, игнор брони 20%; шанс «Оглушение» 20+L%.',
				tags: ['attack', 'debuff'],
			},
			2: {
				mechanics: '70%: −2–3 МР + «Помехи»; иначе «Радость» цели.',
				tags: ['debuff', 'buff'],
			},
			3: {
				mechanics: '«Каменная плоть» союзнику · 2+⌊L/4⌋ р.',
				tags: ['buff'],
			},
			4: {
				mechanics: '+сила магии союзникам (доля 0.25+0.05L).',
				tags: ['buff', 'aoe'],
			},
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	BeerElemental: {
		passiveMechanics: 'В начале хода: −10…80 золота.',
		slots: {
			1: {
				mechanics:
					'«Радость»: +10+2L удачи если удача < 5, иначе +5 · 2 р.',
				tags: ['buff'],
			},
			2: {
				mechanics: '70+2L%: «Головокружение» · 2 р.',
				tags: ['debuff'],
			},
			3: { mechanics: 'Гарант-криты союзнику: +1+⌊L/5⌋.', tags: ['buff'] },
			4: {
				mechanics: '«Отравление» · 2 р.; −1 заряд торпеды.',
				tags: ['debuff'],
			},
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	EvilTree: {
		passiveMechanics:
			'В начале хода: «Укрепление ряда» +2+⌊L/5⌋ брони ряду · 1 р.',
		slots: {
			1: {
				mechanics:
					'«Сосредоточение» + «Удача» союзнику (длительность от L).',
				tags: ['buff'],
			},
			2: {
				mechanics: 'Урон врагу; лечение ряду = урон / N союзников ряда.',
				tags: ['attack', 'heal', 'aoe'],
			},
			3: {
				mechanics: '«Запрет лечения» · 2+⌊L/4⌋ р. (лечение → 0).',
				tags: ['debuff'],
			},
			4: {
				mechanics:
					'3 МР: случайно «Сила» / «Радость» / «Ускорение» · 2 р.',
				tags: ['buff'],
			},
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Mermaid: {
		slots: {
			1: {
				mechanics:
					'Лечение L×5+round(20×(2−оз/max)); +точность L×2+2 навсегда.',
				tags: ['heal', 'buff'],
			},
			2: {
				mechanics: 'Ряд цели: «Оглушение» 38+L% каждому.',
				tags: ['debuff', 'aoe'],
			},
			3: {
				mechanics:
					'«Регенерация» союзнику; «Порабощённый» врагу 1 р. (нежить/механизм — нет).',
				tags: ['heal', 'debuff'],
			},
			4: {
				mechanics:
					'2 МР: «Волшебные оковы» · 2+⌊L/6⌋ р. (жгут при трате маны).',
				tags: ['debuff'],
			},
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Dracolich: {
		passiveMechanics: 'В начале хода: лечение max ОЗ / 6.',
		slots: {
			1: {
				mechanics:
					'Магия всем врагам ×(1+(1−%оз)×0.36); «Отравление» 70+L%.',
				tags: ['attack', 'aoe', 'debuff'],
			},
			2: {
				mechanics:
					'Перемешивание колонн; ряду: «Неудача» + 85% «Слабость».',
				tags: ['debuff', 'aoe'],
			},
			3: {
				mechanics: 'Если ОЗ < 20% от max — мгновенная смерть.',
				tags: ['attack'],
			},
			4: {
				mechanics:
					'Воскрешение нежити с кладбища; 80% запрет повторного воскрешения.',
				tags: ['summon', 'heal'],
			},
			5: {
				mechanics:
					'Хвост: игнор 75% брони, если на цели «Метка», иначе без игнора.',
				tags: ['attack'],
			},
		},
	},
};
