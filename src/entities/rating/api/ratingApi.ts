import { apiFetchJson } from '@/shared/api/http';

import type { RatingRow } from '../model/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

/**
 * Загружает таблицу рейтинга.
 */
export async function fetchRating(): Promise<RatingRow[]> {
	return apiFetchJson(
		'/rating',
		undefined,
		(data) => {
			if (!isRecord(data) || !Array.isArray(data.items)) {
				throw new Error('Некорректный рейтинг');
			}
			return data.items as RatingRow[];
		},
		'Не удалось загрузить рейтинг',
	);
}
