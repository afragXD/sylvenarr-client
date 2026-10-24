export type SquadPresetSlot = {
	id: string;
	heroClassCode: string;
	displayName: string;
	size: number;
	row: number;
	slotOrder: number;
};

export type SquadPreset = {
	id: string;
	name: string;
	teamSize: number;
	isGlobal: boolean;
	catalogCode: string | null;
	slots: SquadPresetSlot[];
	createdAt: string;
	updatedAt: string;
};

export type SquadPresetSlotInput = {
	heroClassCode: string;
	row: number;
};

export type SquadPresetWritePayload = {
	name: string;
	slots: SquadPresetSlotInput[];
	global?: boolean;
};

export type SquadPresetListScope = 'mine' | 'global' | 'all';
