import { apiFetchJson } from '@/shared/api/http';

import type { HeroClass } from '../model/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const parseHero = (data: unknown): HeroClass => {
	if (!isRecord(data) || typeof data.code !== 'string') {
		throw new Error('Некорректный ответ героя');
	}
	return data as unknown as HeroClass;
};

/**
 * Загружает список играбельных героев.
 */
export async function fetchHeroes(): Promise<HeroClass[]> {
	const result = await apiFetchJson(
		'/heroes',
		undefined,
		(data) => {
			if (!isRecord(data) || !Array.isArray(data.items)) {
				throw new Error('Некорректный список героев');
			}
			return data.items.map(parseHero);
		},
		'Не удалось загрузить героев',
	);
	return result;
}

/**
 * Загружает карточку героя по коду.
 */
export async function fetchHeroByCode(code: string): Promise<HeroClass> {
	return apiFetchJson(
		`/heroes/${encodeURIComponent(code)}`,
		undefined,
		parseHero,
		'Герой не найден',
	);
}

export type FavoriteHeroStat = {
	code: string;
	displayName: string;
	pickCount: number;
};

/**
 * Глобальный топ героев по числу выборов на арене.
 */
export async function fetchFavoriteHeroes(limit = 24): Promise<FavoriteHeroStat[]> {
	const query = new URLSearchParams({ limit: String(limit) });
	return apiFetchJson(
		`/heroes/favorites?${query}`,
		undefined,
		(data) => {
			if (!Array.isArray(data)) {
				throw new Error('Некорректный список популярных героев');
			}
			return data
				.filter(isRecord)
				.filter(
					(item) =>
						typeof item.code === 'string' &&
						typeof item.displayName === 'string' &&
						typeof item.pickCount === 'number',
				)
				.map((item) => ({
					code: item.code as string,
					displayName: item.displayName as string,
					pickCount: item.pickCount as number,
				}));
		},
		'Не удалось загрузить популярных героев',
	);
}
