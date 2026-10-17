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
		passiveMechanics:
			'В начале хода: если удача < −10 — случайный враг −(L−1) удачи.',
		slots: {
			1: { mechanics: 'Урон ×1.1×ярость; игнор брони 25%.', tags: ['attack'] },
			2: { mechanics: 'Призыв гоблина (лимит вызовов).', tags: ['summon'] },
			3: {
				mechanics:
					'×0.75; игнор брони 50%; шанс сдвига ряда; шанс «Обездвиженный» · 2 р.',
				tags: ['attack', 'debuff'],
			},
			4: {
				mechanics:
					'Два топора ×0.5; при попадании шанс «Головокружение» · 2 р.; −1…5 удачи.',
				tags: ['attack', 'debuff'],
			},
			5: {
				mechanics:
					'«Радость» своему ряду · 2 р.; +броня себе; −0.06 накопленной ярости.',
				tags: ['buff'],
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
			3: {
				mechanics:
					'Саммону: усиление; союзнику: «Пьющий жизни» · 1 р.',
				tags: ['buff', 'heal'],
			},
			4: {
				mechanics: 'Одной цели: шанс «Ужас» · 2 р.',
				tags: ['debuff'],
			},
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
		passiveMechanics: 'В начале хода: откат тетради смерти −1.',
		slots: {
			1: { mechanics: 'Урон ×1.15; игнор брони 35%.', tags: ['attack'] },
			2: {
				mechanics: 'На себя: «Радость» · 2 р.; +2 урона.',
				tags: ['buff'],
			},
			3: {
				mechanics:
					'Тетрадь: шанс → 1 ОЗ (+удача); провал — себе «Головокружение» · 3 р.',
				tags: ['attack', 'debuff'],
			},
			4: {
				mechanics: 'Дротик (−1 заряд): прямой урон + «Отравление» · 2 р.',
				tags: ['attack', 'debuff'],
			},
			5: {
				mechanics: '«Хамелеон» · 1 р.; рост шанса тетради; −удача.',
				tags: ['buff'],
			},
		},
	},
	Paladin: {
		slots: {
			1: { mechanics: 'Всегда 2 удара ×1.05.', tags: ['attack'] },
			2: {
				mechanics:
					'Ульта (−1): себе «Сила» · 3 р. и «Под охраной» · 2 р.',
				tags: ['buff'],
			},
			3: {
				mechanics:
					'2 МР: ×1.1; игнор брони 15%; шанс украсть урон/силу цели.',
				tags: ['attack', 'debuff'],
			},
			4: {
				mechanics:
					'Рывок на фронт; «Ускорение» · 2 р.; ×1.25 против нежити.',
				tags: ['attack', 'buff'],
			},
			5: {
				mechanics:
					'3 МР: себе «Регенерация» + «Под охраной»; смена ряда; лечение.',
				tags: ['heal', 'buff'],
			},
		},
	},
	Abbess: {
		slots: {
			1: {
				mechanics:
					'2 МР: урон; шанс «Замедление»; шанс запрета воскрешения.',
				tags: ['attack', 'debuff'],
			},
			2: {
				mechanics: '3 МР (задний ряд): лечение всем союзникам.',
				tags: ['heal', 'aoe'],
			},
			3: {
				mechanics: '3 МР: «Каменная плоть» союзнику · 3 р.',
				tags: ['buff'],
			},
			4: {
				mechanics: 'Снимает все эффекты с ряда цели (баффы и дебаффы).',
				tags: ['heal', 'aoe'],
			},
			5: {
				mechanics: 'Ряду цели: «Контрудар» · 3 р.',
				tags: ['buff'],
			},
		},
	},
	Witch: {
		slots: {
			1: {
				mechanics: 'Револьвер (−патрон; шанс 2-го выстрела) / каблук.',
				tags: ['attack'],
			},
			2: {
				mechanics: '3 МР: укус + вампиризм от урона.',
				tags: ['attack', 'heal'],
			},
			3: {
				mechanics: '«Метка» + «Смертный приговор» · 2 р.',
				tags: ['debuff'],
			},
			4: {
				mechanics: '4 МР: шанс снизить урон и силу цели (не под «Под охраной»).',
				tags: ['debuff'],
			},
			5: {
				mechanics: '4 МР: шанс «Бес» · 2 р. (полиморф).',
				tags: ['debuff'],
			},
		},
	},
	Inquisitor: {
		slots: {
			1: { mechanics: 'Удар булавой ×1.', tags: ['attack'] },
			2: {
				mechanics: '3 МР: молния + «Помехи» · 1 р.',
				tags: ['attack', 'debuff'],
			},
			3: {
				mechanics: '3 МР: шанс смены ряда цели (не под «Под охраной»).',
				tags: ['debuff'],
			},
			4: {
				mechanics: '×1.25; шанс «Оглушение» или −броня.',
				tags: ['attack', 'debuff'],
			},
			5: {
				mechanics: '2 МР (задний ряд): ×0.9; шанс «Немота» · 2 р.',
				tags: ['attack', 'debuff'],
			},
		},
	},
	Marauder: {
		slots: {
			1: {
				mechanics: 'Выстрел; ×1.25 против цели с «Меткой»; игнор брони 15%.',
				tags: ['attack'],
			},
			2: {
				mechanics:
					'Ряд цели ×0.5; шанс «Неудача» / «Замедление» · 2 р.',
				tags: ['attack', 'aoe', 'debuff'],
			},
			3: {
				mechanics: 'Мощный выстрел ×1.25; себе «Слабость» · 2 р.',
				tags: ['attack', 'debuff'],
			},
			4: {
				mechanics: 'Ульта (−1): превращение в Оборотня, на фронт.',
				tags: ['buff'],
			},
			5: {
				mechanics: '3 МР: прямой урон ОЗ; шанс сжечь ману цели.',
				tags: ['attack', 'debuff'],
			},
		},
	},
	Werewolf: {
		slots: {
			1: {
				mechanics: '×1.1; шанс «Слабость» · 2 р.',
				tags: ['attack', 'debuff'],
			},
			2: {
				mechanics: 'Укус (задний ряд): игнор брони 35%; вампиризм + МР.',
				tags: ['attack', 'heal'],
			},
			3: {
				mechanics: 'Возврат в Мародёра; +ОЗ.',
				tags: ['heal', 'buff'],
			},
			4: {
				mechanics: 'Колонне цели: «Желчь» · 3 р.',
				tags: ['debuff', 'aoe'],
			},
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Herbalist: {
		slots: {
			1: {
				mechanics: 'Союзнику «Сила» · 1 р. (+доля его урона).',
				tags: ['buff'],
			},
			2: {
				mechanics:
					'1 МР: ряду «Сила» + «Сосредоточение» · 2 р.',
				tags: ['buff', 'aoe'],
			},
			3: {
				mechanics: 'Снимает ослабления с союзника.',
				tags: ['heal'],
			},
			4: {
				mechanics: 'Себе +10 ОЗ (мгновенное лечение).',
				tags: ['heal'],
			},
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
		passiveMechanics:
			'В начале хода: 50% «Под охраной» случайному союзнику · 2 р.',
		slots: {
			1: {
				mechanics: '3 МР (фронт): молния + 2 цепочки ×0.5/×0.25.',
				tags: ['attack', 'aoe'],
			},
			2: {
				mechanics: '5 МР (задний ряд): фантом-копия цели.',
				tags: ['summon'],
			},
			3: {
				mechanics:
					'2 МР: помрачение — шанс, что цель ударит своего союзника.',
				tags: ['debuff', 'attack'],
			},
			4: { mechanics: 'Призыв эктоплазмы на свой ряд.', tags: ['summon'] },
			5: {
				mechanics: '3 МР: философский камень; шанс сохранить ход.',
				tags: ['buff'],
			},
		},
	},
	Pyro: {
		slots: {
			1: {
				mechanics: 'Огнемёт: 2 случайные цели; шанс «Поджог» · 2 р.',
				tags: ['attack', 'aoe', 'debuff'],
			},
			2: {
				mechanics: 'Арбалет (задний ряд): сильнее против цели с «Поджогом».',
				tags: ['attack'],
			},
			3: {
				mechanics:
					'«Поджог» всем на фронте · 2 р.; перемешать колонны врагов.',
				tags: ['debuff', 'aoe'],
			},
			4: {
				mechanics: 'Союзнику «Огненное оружие» · 1 р.',
				tags: ['buff'],
			},
			5: {
				mechanics:
					'Самосожжение: себя убивает; цели «Ужас»/«Неудача»; бафф лидеру.',
				tags: ['debuff', 'buff'],
			},
		},
	},
	Specter: {
		passiveMechanics: 'В начале хода: −2 МР у лидера врагов.',
		slots: {
			1: {
				mechanics: 'До 2 целей: шанс «Оглушение» · 1 р. или урон.',
				tags: ['attack', 'debuff'],
			},
			2: {
				mechanics: 'Урон цели; себе «Под охраной» · 2 р.',
				tags: ['attack', 'buff'],
			},
			3: {
				mechanics: '«Метка» + «Неудача» · 2 р.',
				tags: ['debuff'],
			},
			4: {
				mechanics: 'Шанс «Кровотечение» · 2 р.',
				tags: ['debuff'],
			},
			5: { mechanics: 'Базовые действия.', tags: ['buff'] },
		},
	},
	Detective: {
		slots: {
			1: {
				mechanics:
					'Рапира ×1.1; игнор брони 25%; под «Невидимостью» бьёт как дальник.',
				tags: ['attack'],
			},
			2: {
				mechanics: 'Ульта (−1): «Отравление» всем врагам · 2 р.',
				tags: ['debuff', 'aoe'],
			},
			3: {
				mechanics: 'Ульта (−1): «Невидимость» на себя · 2 р.',
				tags: ['buff'],
			},
			4: {
				mechanics:
					'Выпад с заднего ряда + смена ряда; себе «Контрудар» · 2 р.',
				tags: ['attack', 'buff'],
			},
			5: {
				mechanics: 'Фронт: выстрел в упор / иначе перезарядка (+удача).',
				tags: ['attack'],
			},
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
