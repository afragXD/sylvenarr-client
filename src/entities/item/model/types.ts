export type ItemTarget = 'self' | 'ally' | 'allySummon' | 'enemy' | 'enemySummon' | 'sellOnly';

export type ItemBrief = {
	code: number;
	name: string;
	description: string;
	cost: number;
	category: number;
	tier: number;
	target: ItemTarget;
	sellOnly: boolean;
};

export type PerkBrief = {
	id: string;
	name: string;
	description: string;
	kind: 'item' | 'other';
	category?: number;
};
