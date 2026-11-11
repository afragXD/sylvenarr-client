export type CreatorMatchListItem = {
	id: string;
	hostDisplayName: string;
	guestDisplayName: string | null;
	stage: number | null;
	status: 'fighting';
};

export type CreatorEditorUnit = {
	id: string;
	playerId: string;
	team: 0 | 1;
	heroClassCode: string;
	displayName: string;
	row: number;
	column: number;
	health: number;
	maxHp: number;
	alive: boolean;
	damage: number;
	armor: number;
	initiative: number;
	dodge: number;
	luck: number;
	accuracy: number;
	power: number;
	mana: number;
	maxMana: number;
	morale: number;
	lvl: number;
	hiddenLvl: number;
	ultaCharges: number;
	critBank: number;
	isSummon: boolean;
};

export type CreatorInventoryStack = {
	code: number;
	name: string;
	description: string;
	quantity: number;
	category: number;
	tier: number;
	target: 'self' | 'ally' | 'allySummon' | 'enemy' | 'enemySummon' | 'sellOnly';
};

export type CreatorEditorTeam = {
	gold: number;
	inventory: CreatorInventoryStack[];
};

export type CreatorMatchDetail = {
	id: string;
	status: 'fighting';
	hostDisplayName: string;
	guestDisplayName: string | null;
	stage: number;
	phase: string;
	activeUnitId: string | null;
	units: CreatorEditorUnit[];
	teams: [CreatorEditorTeam, CreatorEditorTeam];
};

export type CreatorUnitPatch = Partial<{
	health: number;
	maxHp: number;
	damage: number;
	armor: number;
	initiative: number;
	dodge: number;
	luck: number;
	accuracy: number;
	power: number;
	mana: number;
	maxMana: number;
	morale: number;
	lvl: number;
	ultaCharges: number;
	critBank: number;
}>;

export type CreatorInventoryStackPatch = {
	code: number;
	quantity: number;
};
