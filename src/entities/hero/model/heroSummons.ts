export type SummonRef = {
	code: string;
	/** Подпись рядом с именем (эволюция и т.п.). */
	note?: string;
};

export type SummonerSummons = {
	entries: SummonRef[];
	/** Доп. текст без отдельной карточки (фантом и т.п.). */
	footnote?: string;
};

/**
 * Призывы / формы призывателя → коды классов в реестре.
 * Imp не включён — в порте не призывается.
 */
export const SUMMONER_SUMMONS: Record<string, SummonerSummons> = {
	OrcKing: {
		entries: [{ code: 'GoblinShaman' }, { code: 'GoblinTrapper' }],
	},
	Archlich: {
		entries: [
			{ code: 'Zombie' },
			{ code: 'SkeletonChampion', note: 'эволюция нежити' },
			{ code: 'GhostWarrior', note: 'эволюция нежити' },
			{ code: 'EvilTree', note: 'эволюция нежити' },
		],
	},
	Demiurge: {
		entries: [{ code: 'Ectoplasm' }],
		footnote: 'Также создаёт фантом-копию выбранной цели (статы от шаблона).',
	},
	Marauder: {
		entries: [{ code: 'Werewolf', note: 'боевая форма' }],
	},
};

/**
 * Список призывов для карточки героя или null, если призывов нет.
 */
export function getSummonerSummons(code: string): SummonerSummons | null {
	return SUMMONER_SUMMONS[code] ?? null;
}
