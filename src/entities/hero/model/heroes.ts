import { createEffect, createEvent, createStore, sample } from 'effector';

import { fetchHeroes } from '../api/heroesApi';
import type { HeroClass } from './types';

const toErrorMessage = (error: unknown): string => {
	if (error instanceof Error && error.message) {
		return error.message;
	}
	return 'Не удалось загрузить героев';
};

/** Страница каталога смонтирована. */
export const heroesPageMounted = createEvent();

/** Явный запрос списка героев. */
export const heroesRequested = createEvent();

export const fetchHeroesFx = createEffect(async (): Promise<HeroClass[]> => {
	return fetchHeroes();
});

export const $heroes = createStore<HeroClass[]>([]).on(
	fetchHeroesFx.doneData,
	(_, heroes) => heroes,
);

export const $heroesPending = fetchHeroesFx.pending;

/** Первый запрос списка уже завершился (успех или ошибка). */
export const $heroesReady = createStore(false).on(fetchHeroesFx.finally, () => true);

export const $heroesError = createStore<string | null>(null)
	.on(fetchHeroesFx, () => null)
	.on(fetchHeroesFx.failData, (_, error) => toErrorMessage(error));

sample({
	clock: [heroesPageMounted, heroesRequested],
	target: fetchHeroesFx,
});
