import { apiFetchJson } from '@/shared/api/http';

import type { Match, MatchHistoryDetail, MatchHistoryItem } from '../model/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const parseMatch = (data: unknown): Match => {
	if (!isRecord(data) || typeof data.id !== 'string' || typeof data.inviteCode !== 'string') {
		throw new Error('Некорректный ответ матча');
	}
	if (!isRecord(data.draft)) {
		throw new Error('Некорректный draft state матча');
	}
	return data as unknown as Match;
};

/**
 * Создаёт лобби.
 */
export async function createMatch(): Promise<Match> {
	return apiFetchJson('/matches', { method: 'POST' }, parseMatch, 'Не удалось создать матч');
}

/**
 * Присоединяется к лобби по коду.
 */
export async function joinMatch(inviteCode: string): Promise<Match> {
	return apiFetchJson(
		'/matches/join',
		{
			method: 'POST',
			body: JSON.stringify({ inviteCode }),
		},
		parseMatch,
		'Не удалось присоединиться к матчу',
	);
}

/**
 * Загружает матч по id.
 */
export async function fetchMatchById(id: string): Promise<Match> {
	return apiFetchJson(
		`/matches/${encodeURIComponent(id)}`,
		undefined,
		parseMatch,
		'Матч не найден',
	);
}

/**
 * Пик героя в draft.
 */
export async function draftPick(input: {
	readonly matchId: string;
	readonly heroCode: string;
	readonly row: number;
}): Promise<Match> {
	return apiFetchJson(
		`/matches/${encodeURIComponent(input.matchId)}/draft/pick`,
		{
			method: 'POST',
			body: JSON.stringify({ heroCode: input.heroCode, row: input.row }),
		},
		parseMatch,
		'Не удалось выбрать героя',
	);
}

/**
 * Случайный пик в draft.
 */
export async function draftRandom(input: {
	readonly matchId: string;
	readonly row?: number;
}): Promise<Match> {
	return apiFetchJson(
		`/matches/${encodeURIComponent(input.matchId)}/draft/random`,
		{
			method: 'POST',
			body: JSON.stringify(input.row === undefined ? {} : { row: input.row }),
		},
		parseMatch,
		'Не удалось выбрать случайного героя',
	);
}

/**
 * Перенос своего пика на другой ряд.
 */
export async function moveDraftPick(input: {
	readonly matchId: string;
	readonly pickId: string;
	readonly row: number;
}): Promise<Match> {
	return apiFetchJson(
		`/matches/${encodeURIComponent(input.matchId)}/draft/picks/${encodeURIComponent(input.pickId)}`,
		{
			method: 'PATCH',
			body: JSON.stringify({ row: input.row }),
		},
		parseMatch,
		'Не удалось переместить героя',
	);
}

/**
 * Отменяет матч (хост).
 */
export async function cancelMatch(id: string): Promise<Match> {
	return apiFetchJson(
		`/matches/${encodeURIComponent(id)}/cancel`,
		{ method: 'POST' },
		parseMatch,
		'Не удалось отменить матч',
	);
}

/**
 * Действие юнита в бою.
 */
export async function battleAction(input: {
	readonly matchId: string;
	readonly unitId: string;
	readonly action: 'attack' | 'defend' | 'wait' | 'skill' | 'ability';
	readonly targetId?: string;
	readonly slot?: 1 | 2 | 3 | 4 | 5;
	readonly choice?: string;
}): Promise<Match> {
	return apiFetchJson(
		`/matches/${encodeURIComponent(input.matchId)}/battle/action`,
		{
			method: 'POST',
			body: JSON.stringify({
				unitId: input.unitId,
				action: input.action,
				targetId: input.targetId,
				slot: input.slot,
				choice: input.choice,
			}),
		},
		parseMatch,
		'Не удалось выполнить действие',
	);
}

/**
 * История завершённых матчей текущего игрока.
 */
export async function fetchMyMatches(): Promise<MatchHistoryItem[]> {
	return apiFetchJson(
		'/players/me/matches',
		undefined,
		(data) => {
			if (!Array.isArray(data)) {
				throw new Error('Некорректный ответ истории');
			}
			return data as MatchHistoryItem[];
		},
		'Не удалось загрузить историю матчей',
	);
}

/**
 * Детали завершённого матча.
 */
export async function fetchMyMatchDetail(matchId: string): Promise<MatchHistoryDetail> {
	return apiFetchJson(
		`/players/me/matches/${encodeURIComponent(matchId)}`,
		undefined,
		(data) => {
			if (!isRecord(data) || typeof data.id !== 'string') {
				throw new Error('Некорректный ответ деталей матча');
			}
			return data as unknown as MatchHistoryDetail;
		},
		'Не удалось загрузить матч',
	);
}
