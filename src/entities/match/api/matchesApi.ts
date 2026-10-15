import { apiFetchJson } from '@/shared/api/http';

import type { Match } from '../model/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const parseMatch = (data: unknown): Match => {
	if (!isRecord(data) || typeof data.id !== 'string' || typeof data.inviteCode !== 'string') {
		throw new Error('Некорректный ответ матча');
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
