export type AbilityTag = 'buff' | 'debuff' | 'attack' | 'aoe' | 'heal' | 'summon';

export const ABILITY_TAG_LABELS: Record<AbilityTag, string> = {
	buff: 'Бафф',
	debuff: 'Дебафф',
	attack: 'Атака',
	aoe: 'По площади',
	heal: 'Лечение',
	summon: 'Призыв',
};
