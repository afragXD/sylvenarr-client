import { apiFetchJson } from '@/shared/api/http';

import type {
	CreatorEditorTeam,
	CreatorInventoryStack,
	CreatorInventoryStackPatch,
	CreatorMatchDetail,
	CreatorMatchListItem,
	CreatorUnitPatch,
} from '../model/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const parseListItem = (data: unknown): CreatorMatchListItem => {
	if (!isRecord(data) || typeof data.id !== 'string') {
		throw new Error('Некорректный матч');
	}
	return {
		id: data.id,
		hostDisplayName: String(data.hostDisplayName ?? ''),
		guestDisplayName: typeof data.guestDisplayName === 'string' ? data.guestDisplayName : null,
		stage: typeof data.stage === 'number' ? data.stage : null,
		status: 'fighting',
	};
};

const parseUnit = (data: unknown) => {
	if (!isRecord(data) || typeof data.id !== 'string') {
		throw new Error('Некорректный юнит');
	}
	return {
		id: data.id,
		playerId: String(data.playerId ?? ''),
		team: data.team === 1 ? (1 as const) : (0 as const),
		heroClassCode: String(data.heroClassCode ?? ''),
		displayName: String(data.displayName ?? ''),
		row: Number(data.row ?? 0),
		column: Number(data.column ?? 0),
		health: Number(data.health ?? 0),
		maxHp: Number(data.maxHp ?? 0),
		alive: Boolean(data.alive),
		damage: Number(data.damage ?? 0),
		armor: Number(data.armor ?? 0),
		initiative: Number(data.initiative ?? 0),
		dodge: Number(data.dodge ?? 0),
		luck: Number(data.luck ?? 0),
		accuracy: Number(data.accuracy ?? 0),
		power: Number(data.power ?? 0),
		mana: Number(data.mana ?? 0),
		maxMana: Number(data.maxMana ?? 0),
		morale: Number(data.morale ?? 0),
		lvl: Number(data.lvl ?? 1),
		hiddenLvl: Number(data.hiddenLvl ?? 1),
		ultaCharges: Number(data.ultaCharges ?? 0),
		critBank: Number(data.critBank ?? 0),
		isSummon: Boolean(data.isSummon),
	};
};

const parseInventoryStack = (data: unknown): CreatorInventoryStack => {
	if (!isRecord(data) || typeof data.code !== 'number') {
		throw new Error('Некорректный стек инвентаря');
	}
	const targetRaw = String(data.target ?? 'self');
	const target =
		targetRaw === 'ally' ||
		targetRaw === 'allySummon' ||
		targetRaw === 'enemy' ||
		targetRaw === 'enemySummon' ||
		targetRaw === 'sellOnly'
			? targetRaw
			: 'self';
	return {
		code: data.code,
		name: String(data.name ?? ''),
		description: String(data.description ?? ''),
		quantity: Number(data.quantity ?? 0),
		category: Number(data.category ?? 0),
		tier: Number(data.tier ?? 0),
		target,
	};
};

const emptyTeam = (): CreatorEditorTeam => ({ gold: 0, inventory: [] });

const parseTeam = (data: unknown): CreatorEditorTeam => {
	if (!isRecord(data)) {
		return emptyTeam();
	}
	const inventory = Array.isArray(data.inventory) ? data.inventory.map(parseInventoryStack) : [];
	return {
		gold: Number(data.gold ?? 0),
		inventory,
	};
};

const parseDetail = (data: unknown): CreatorMatchDetail => {
	if (!isRecord(data) || typeof data.id !== 'string' || !Array.isArray(data.units)) {
		throw new Error('Некорректный снимок боя');
	}
	const teamsRaw = Array.isArray(data.teams) ? data.teams : [];
	return {
		id: data.id,
		status: 'fighting',
		hostDisplayName: String(data.hostDisplayName ?? ''),
		guestDisplayName: typeof data.guestDisplayName === 'string' ? data.guestDisplayName : null,
		stage: Number(data.stage ?? 0),
		phase: String(data.phase ?? 'combat'),
		activeUnitId: typeof data.activeUnitId === 'string' ? data.activeUnitId : null,
		units: data.units.map(parseUnit),
		teams: [parseTeam(teamsRaw[0]), parseTeam(teamsRaw[1])],
	};
};

const parseList = (data: unknown): CreatorMatchListItem[] => {
	if (!Array.isArray(data)) {
		throw new Error('Некорректный список матчей');
	}
	return data.map(parseListItem);
};

export async function fetchCreatorMatches(): Promise<CreatorMatchListItem[]> {
	return apiFetchJson('/creator/matches', undefined, parseList, 'Не удалось загрузить матчи');
}

export async function fetchCreatorMatch(id: string): Promise<CreatorMatchDetail> {
	return apiFetchJson(
		`/creator/matches/${id}`,
		undefined,
		parseDetail,
		'Не удалось загрузить матч',
	);
}

export async function patchCreatorUnit(
	matchId: string,
	unitId: string,
	patch: CreatorUnitPatch,
): Promise<CreatorMatchDetail> {
	return apiFetchJson(
		`/creator/matches/${matchId}/units/${unitId}`,
		{
			method: 'PATCH',
			body: JSON.stringify(patch),
		},
		parseDetail,
		'Не удалось сохранить юнита',
	);
}

export async function patchCreatorTeamInventory(
	matchId: string,
	team: 0 | 1,
	inventory: CreatorInventoryStackPatch[],
): Promise<CreatorMatchDetail> {
	return apiFetchJson(
		`/creator/matches/${matchId}/teams/${team}`,
		{
			method: 'PATCH',
			body: JSON.stringify({ inventory }),
		},
		parseDetail,
		'Не удалось сохранить инвентарь',
	);
}
