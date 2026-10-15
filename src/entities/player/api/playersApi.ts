import { apiFetchJson } from '@/shared/api/http';

import type { Player } from '../model/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const parsePlayer = (data: unknown): Player => {
	if (!isRecord(data) || typeof data.id !== 'string' || typeof data.displayName !== 'string') {
		throw new Error('Некорректный ответ игрока');
	}
	return {
		id: data.id,
		displayName: data.displayName,
		createdAt: String(data.createdAt),
	};
};

/**
 * Создаёт гостя или возвращает текущего из cookie.
 */
export async function ensureGuestPlayer(displayName?: string): Promise<Player> {
	return apiFetchJson(
		'/players',
		{
			method: 'POST',
			body: JSON.stringify(displayName ? { displayName } : {}),
		},
		parsePlayer,
		'Не удалось создать игрока',
	);
}

/**
 * Текущий игрок из сессии.
 */
export async function fetchCurrentPlayer(): Promise<Player> {
	return apiFetchJson('/players/me', undefined, parsePlayer, 'Сессия игрока не найдена');
}
