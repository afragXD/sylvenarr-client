import { apiFetchJson } from '@/shared/api/http';

import type { RatingRow } from '../model/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const parseRatingRow = (value: unknown): RatingRow | null => {
	if (!isRecord(value)) {
		return null;
	}
	if (
		typeof value.playerId !== 'string' ||
		typeof value.displayName !== 'string' ||
		typeof value.pts !== 'number' ||
		typeof value.wins !== 'number' ||
		typeof value.losses !== 'number' ||
		typeof value.draws !== 'number' ||
		typeof value.games !== 'number'
	) {
		return null;
	}
	return {
		playerId: value.playerId,
		displayName: value.displayName,
		avatarUrl: typeof value.avatarUrl === 'string' ? value.avatarUrl : null,
		pts: value.pts,
		wins: value.wins,
		losses: value.losses,
		draws: value.draws,
		games: value.games,
	};
};

/**
 * Загружает таблицу рейтинга (ПТС).
 */
export async function fetchRating(): Promise<RatingRow[]> {
	return apiFetchJson(
		'/rating',
		undefined,
		(data) => {
			if (!isRecord(data) || !Array.isArray(data.items)) {
				throw new Error('Некорректный рейтинг');
			}
			const items = data.items.map(parseRatingRow);
			if (items.some((item) => item === null)) {
				throw new Error('Некорректный рейтинг');
			}
			return items as RatingRow[];
		},
		'Не удалось загрузить рейтинг',
	);
}
