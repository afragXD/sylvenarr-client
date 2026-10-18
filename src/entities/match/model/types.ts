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

export type BattleEffectBrief = {
	id: string;
	rounds: number;
	power?: number;
};

export type ResistBrief = {
	source: string;
	label: string;
	value: number;
	wardCharges: number | null;
	immune: boolean;
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
	effects: BattleEffectBrief[];
	isSummon: boolean;
	horseIsDead: boolean;
	mana: number;
	damage: number;
	armor: number;
	initiative: number;
	dodge: number;
	luck: number;
	accuracy: number;
	power: number;
	gold: number;
	critBank: number;
	ultaCharges: number;
	/** Уровень юнита в бою. */
	lvl?: number;
	/** Ненулевые сопротивления / варды / иммунитеты. */
	resists?: ResistBrief[];
};

export type TurnOrderPhase = 'acted' | 'active' | 'waiting' | 'delayed' | 'dead';

export type TurnOrderEntry = {
	unitId: string;
	displayName: string;
	heroClassCode: string;
	team: 0 | 1;
	alive: boolean;
	isActive: boolean;
	/** Фаза в шкале раунда; старше клиентов без поля — трактовать по isActive/alive. */
	phase?: TurnOrderPhase;
	lvl?: number;
};

export type AbilityInfo = {
	slot: 1 | 2 | 3 | 4 | 5;
	label: string;
	needsTarget: boolean;
	disabledReason: string | null;
	legalTargetIds: string[];
};

export type PendingPrompt = {
	unitId: string;
	kind: string;
	slot: 1 | 2 | 3 | 4 | 5;
	options: { id: string; label: string; description?: string }[];
};

export type BattleState = {
	stage: number;
	activeUnitId: string | null;
	turnPlayerId: string | null;
	outcome: 'ongoing' | 'host_win' | 'guest_win' | 'draw';
	winnerPlayerId: string | null;
	log: string[];
	turnOrder: TurnOrderEntry[];
	legalTargetIds: string[];
	skillLabel: string | null;
	legalSkillTargetIds: string[];
	abilities: AbilityInfo[];
	pendingPrompt: PendingPrompt | null;
	units: BattleUnit[];
};

export type { HeroDupesMode, MatchRules } from './matchRules';

export type Match = {
	id: string;
	status: MatchStatus;
	inviteCode: string;
	host: MatchPlayerBrief;
	guest: MatchPlayerBrief | null;
	createdAt: string;
	finishedAt: string | null;
	winnerPlayerId: string | null;
	rules: MatchRules;
	draft: MatchDraftState;
	battle: BattleState | null;
};

export type MatchHistoryItem = {
	id: string;
	result: 'win' | 'loss' | 'draw';
	opponentName: string;
	finishedAt: string;
	durationSeconds: number | null;
};

export type MatchHistoryUnit = {
	pickId: string;
	heroClassCode: string;
	displayName: string;
	row: number;
	column: number;
	maxHp: number;
	health: number;
	alive: boolean;
	damage: number;
	armor: number;
	initiative: number;
	lvl?: number;
};

export type MatchHistoryTeam = {
	playerId: string;
	displayName: string;
	units: MatchHistoryUnit[];
};

export type MatchHistoryDetail = {
	id: string;
	result: 'win' | 'loss' | 'draw';
	opponentName: string;
	finishedAt: string;
	durationSeconds: number | null;
	stage: number | null;
	outcome: 'host_win' | 'guest_win' | 'draw' | null;
	hasSnapshot: boolean;
	log: string[];
	host: MatchHistoryTeam;
	guest: MatchHistoryTeam;
};
