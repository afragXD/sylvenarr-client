import type { HeroDupesMode, MatchRules } from './matchRules';

export type { HeroDupesMode, MatchRules };

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
	avatarUrl: string | null;
};

export type MatchDraftPickSource = 'draft' | 'preset';

export type MatchDraftPick = {
	id: string;
	playerId: string;
	heroClassCode: string;
	displayName: string;
	size: number;
	row: number;
	pickOrder: number;
	source?: MatchDraftPickSource;
};

export type MatchDraftEntry = 'empty' | 'draft' | 'preset';

export type MatchDraftState = {
	turnPlayerId: string | null;
	hostPicks: MatchDraftPick[];
	guestPicks: MatchDraftPick[];
	hostSize: number;
	guestSize: number;
	initialTeamSize: number;
	hostEntry?: MatchDraftEntry;
	guestEntry?: MatchDraftEntry;
	/** Имя пресета хозяина (если отряд из пресета); для баннера в начале боя. */
	hostPresetName?: string | null;
	guestPresetName?: string | null;
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
	effects: BattleEffectBrief[];
	isSummon: boolean;
	/** Хозяин саммона (CUT-2026-11-05 AC-1). */
	summonerId?: string | null;
	summonerName?: string | null;
	/** Пол юнита (переиспользуемо; CUT-2026-11-05 ПЭ). */
	gender?: 'female' | 'male' | 'none';
	horseIsDead: boolean;
	mana: number;
	maxMana: number;
	damage: number;
	armor: number;
	initiative: number;
	dodge: number;
	luck: number;
	accuracy: number;
	power: number;
	critBank: number;
	ultaCharges: number;
	/** Уровень юнита в бою. */
	lvl?: number;
	/** Боевой дух. */
	morale?: number;
	/** Ненулевые сопротивления / варды / иммунитеты. */
	resists?: ResistBrief[];
	/** Изученные перки (economyOn). */
	perks?: string[];
	/** Навык торговли 0…1+. */
	merchant?: number;
	/** Радиус оружия по колонкам. */
	weaponReach?: number;
};

export type InventoryStack = {
	code: number;
	name: string;
	description: string;
	quantity: number;
	category: number;
	tier: number;
	target: 'self' | 'ally' | 'allySummon' | 'enemy' | 'enemySummon' | 'sellOnly';
};

/** Кошелёк отряда в сводке боя (CUT-2026-11-03b T3). */
export type BattleTeamEconomy = {
	gold: number;
	inventory?: InventoryStack[];
};

export type BattlePhase = 'combat' | 'perks' | 'fair';

export type PerkOfferOption = {
	id: string;
	name: string;
	description: string;
	kind: 'item' | 'other';
	learned: boolean;
};

export type PerkOffer = {
	unitId: string;
	playerId: string;
	done: boolean;
	options: PerkOfferOption[];
};

export type FairShopEntry = {
	code: number;
	name: string;
	description: string;
	category: number;
	tier: number;
	cost: number;
	buyPrice: number;
};

export type FairSellEntry = {
	code: number;
	name: string;
	sellPrice: number;
};

export type FairSummary = {
	index: number;
	turnTeam: 0 | 1;
	stopped: [boolean, boolean];
	traderIds: [string, string];
	shop: FairShopEntry[];
	sellByTeam: [FairSellEntry[], FairSellEntry[]];
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

export type AttackKind = 'melee' | 'ranged' | 'magic';

export type AbilityInfo = {
	slot: 1 | 2 | 3 | 4 | 5;
	label: string;
	needsTarget: boolean;
	disabledReason: string | null;
	legalTargetIds: string[];
	/** Тип атаки способности; null/нет — способность без прямого урона. */
	attackKind?: AttackKind | null;
	/** CUT AC-13: параметры превью урона/лечения при наведении на цель. */
	previewDamageMult?: number;
	previewArmorIgnore?: number;
	previewSource?: string;
	previewAccuracyPenalty?: number;
	previewHealMin?: number;
	previewHealMax?: number;
};

export type PendingPrompt = {
	unitId: string;
	kind: string;
	slot: 1 | 2 | 3 | 4 | 5 | null;
	options: { id: string; label: string; description?: string }[];
	source?: 'ability' | 'item';
	itemCode?: number | null;
};

export type BattleSfxEvent = {
	seq: number;
	unitId: string;
	heroClassCode: string;
	kind: 'ability' | 'death';
	slot?: 1 | 2 | 3 | 4 | 5;
};

export type BattleState = {
	stage: number;
	activeUnitId: string | null;
	turnPlayerId: string | null;
	outcome: 'ongoing' | 'host_win' | 'guest_win' | 'draw';
	winnerPlayerId: string | null;
	drawOfferByPlayerId: string | null;
	log: string[];
	/** Звуковые события (хвост); у старого сервера поля нет. */
	sfxEvents?: BattleSfxEvent[];
	turnOrder: TurnOrderEntry[];
	legalTargetIds: string[];
	/** Тип кнопки «Атака» активного юнита; у старого сервера поля нет. */
	attackKind?: AttackKind | null;
	skillLabel: string | null;
	legalSkillTargetIds: string[];
	abilities: AbilityInfo[];
	pendingPrompt: PendingPrompt | null;
	units: BattleUnit[];
	/** Кошельки [host, guest]; у старого сервера поля нет. */
	teams?: [BattleTeamEconomy, BattleTeamEconomy];
	/** Ярмарка/перки/предметы включены. */
	economyEnabled?: boolean;
	phase?: BattlePhase;
	perkOffers?: PerkOffer[] | null;
	fair?: FairSummary | null;
};

/** ПТС текущего игрока по матчу; null — матч без рейтинга. */
export type MatchMyRating = {
	ptsBefore: number;
	ptsAfter: number;
	ptsDelta: number;
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
	/** Длительность боя; у незавершённых обычно null. */
	durationSeconds?: number | null;
	/** Рейтинг зрителя; null/отсутствует — «матч без рейтинга». */
	myRating?: MatchMyRating | null;
	rules: MatchRules;
	draft: MatchDraftState;
	battle: BattleState | null;
};

export type MatchHistoryItem = {
	id: string;
	result: 'win' | 'loss' | 'draw';
	opponentName: string;
	opponentAvatarUrl: string | null;
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
	avatarUrl: string | null;
	units: MatchHistoryUnit[];
};

export type MatchHistoryDetail = {
	id: string;
	result: 'win' | 'loss' | 'draw';
	opponentName: string;
	opponentAvatarUrl: string | null;
	finishedAt: string;
	durationSeconds: number | null;
	stage: number | null;
	outcome: 'host_win' | 'guest_win' | 'draw' | null;
	hasSnapshot: boolean;
	log: string[];
	host: MatchHistoryTeam;
	guest: MatchHistoryTeam;
};
