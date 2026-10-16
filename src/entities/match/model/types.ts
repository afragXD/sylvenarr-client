export type MatchStatus = 'waiting' | 'ready' | 'drafting' | 'drafted' | 'cancelled';

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

export type Match = {
	id: string;
	status: MatchStatus;
	inviteCode: string;
	host: MatchPlayerBrief;
	guest: MatchPlayerBrief | null;
	createdAt: string;
	draft: MatchDraftState;
};
