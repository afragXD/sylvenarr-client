export type MatchStatus = 'waiting' | 'ready' | 'cancelled';

export type MatchPlayerBrief = {
	id: string;
	displayName: string;
};

export type Match = {
	id: string;
	status: MatchStatus;
	inviteCode: string;
	host: MatchPlayerBrief;
	guest: MatchPlayerBrief | null;
	createdAt: string;
};
