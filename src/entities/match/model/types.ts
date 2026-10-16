export type MatchStatus =
	| 'waiting'
	| 'ready'
	| 'drafting'
	| 'drafted'
	| 'fighting'
	| 'finished'
	| 'cancelled';

export type MatchPlayerBrief = {
	id: string;
	displayName: string;
};

export type MatchDraftPick = {
	id: string;
	playerId: string;
	heroClassCode: string;
	displayName: string;
	size: number;
	row: number;
	pickOrder: number;
};

export type MatchDraftState = {
	turnPlayerId: string | null;
	hostPicks: MatchDraftPick[];
	guestPicks: MatchDraftPick[];
	hostSize: number;
	guestSize: number;
	initialTeamSize: number;
};

export type BattleUnit = {
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
	defending: boolean;
	attackStyle: 'melee' | 'ranged' | 'magic';
};

export type BattleState = {
	stage: number;
	activeUnitId: string | null;
	turnPlayerId: string | null;
	outcome: 'ongoing' | 'host_win' | 'guest_win' | 'draw';
	winnerPlayerId: string | null;
	log: string[];
	legalTargetIds: string[];
	skillLabel: string | null;
	legalSkillTargetIds: string[];
	units: BattleUnit[];
};

export type Match = {
	id: string;
	status: MatchStatus;
	inviteCode: string;
	host: MatchPlayerBrief;
	guest: MatchPlayerBrief | null;
	createdAt: string;
	finishedAt: string | null;
	winnerPlayerId: string | null;
	draft: MatchDraftState;
	battle: BattleState | null;
};

export type MatchHistoryItem = {
	id: string;
	result: 'win' | 'loss' | 'draw';
	opponentName: string;
	finishedAt: string;
	heroCodes: string[];
};
