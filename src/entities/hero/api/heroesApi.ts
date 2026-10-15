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
