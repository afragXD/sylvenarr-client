export type HeroRoleTag = {
	id: string;
	label: string;
	mood: string;
};

export type HeroClass = {
	code: string;
	displayName: string;
	description: string;
	roleSummary: string;
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
	gold: number;
	accuracy: number;
	size: number;
	isPlayable: boolean;
	sortOrder: number;
	tags: HeroRoleTag[];
};
