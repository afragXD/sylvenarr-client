import { apiFetchJson } from '@/shared/api/http';
import { API_BASE_URL } from '@/shared/constants';

import type { AuthProvider, Player } from '../model/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const parsePlayer = (data: unknown): Player => {
	if (!isRecord(data) || typeof data.id !== 'string' || typeof data.displayName !== 'string') {
		throw new Error('Некорректный ответ игрока');
	}
	const providers = Array.isArray(data.providers)
		? data.providers.filter((item): item is string => typeof item === 'string')
		: [];
	const role = data.role === 'admin' ? 'admin' : 'player';
	return {
		id: data.id,
		displayName: data.displayName,
		email: typeof data.email === 'string' ? data.email : null,
		avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : null,
		role,
		providers,
		createdAt: String(data.createdAt),
	};
};

/**
 * Текущий авторизованный игрок из сессии.
 */
export async function fetchCurrentPlayer(): Promise<Player> {
	return apiFetchJson('/players/me', undefined, parsePlayer, 'Требуется авторизация');
}

/**
 * Список включённых OAuth-провайдеров.
 */
export async function fetchAuthProviders(): Promise<AuthProvider[]> {
	return apiFetchJson(
		'/auth/providers',
		undefined,
		(data) => {
			if (!isRecord(data) || !Array.isArray(data.items)) {
				throw new Error('Некорректный список провайдеров');
			}
			return data.items
				.filter(isRecord)
				.filter((item) => typeof item.id === 'string' && typeof item.label === 'string')
				.map((item) => ({ id: item.id as string, label: item.label as string }));
		},
		'Не удалось загрузить способы входа',
	);
}

/**
 * URL старта OAuth на API.
 */
export function getOAuthStartUrl(providerId: string): string {
	return `${API_BASE_URL}/auth/${encodeURIComponent(providerId)}`;
}

/**
 * Вход по логину/почте и паролю.
 */
export async function loginWithPassword(input: {
	readonly loginOrEmail: string;
	readonly password: string;
}): Promise<{ playerId: string; displayName: string }> {
	return apiFetchJson(
		'/auth/login',
		{
			method: 'POST',
			body: JSON.stringify({
				loginOrEmail: input.loginOrEmail,
				password: input.password,
			}),
		},
		(data) => {
			if (
				!isRecord(data) ||
				data.ok !== true ||
				typeof data.playerId !== 'string' ||
				typeof data.displayName !== 'string'
			) {
				throw new Error('Некорректный ответ входа');
			}
			return { playerId: data.playerId, displayName: data.displayName };
		},
		'Неверный логин или пароль',
	);
}

/**
 * Выход: очистка cookie сессии на API.
 */
export async function logoutPlayer(): Promise<void> {
	await apiFetchJson('/auth/logout', { method: 'POST' }, () => undefined, 'Не удалось выйти');
}
