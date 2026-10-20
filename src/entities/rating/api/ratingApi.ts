import { apiFetchJson } from '@/shared/api/http';

import type { RatingRow } from '../model/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const isRatingRow = (value: unknown): value is RatingRow => {
	if (!isRecord(value)) {
		return false;
	}
	return (
		typeof value.playerId === 'string' &&
		typeof value.displayName === 'string' &&
		typeof value.pts === 'number' &&
		typeof value.wins === 'number' &&
		typeof value.losses === 'number' &&
		typeof value.draws === 'number' &&
		typeof value.games === 'number'
	);
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
			if (!data.items.every(isRatingRow)) {
				throw new Error('Некорректный рейтинг');
			}
			return data.items;
		},
		'Не удалось загрузить рейтинг',
	);
}
