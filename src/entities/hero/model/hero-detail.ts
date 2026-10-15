import { createEffect, createEvent, createStore, sample } from 'effector';

import { fetchHeroByCode } from '../api/heroesApi';
import type { HeroClass } from './types';

const toErrorMessage = (error: unknown): string => {
	if (error instanceof Error && error.message) {
		return error.message;
	}
	return 'Герой не найден';
};

/** Открыта карточка героя (code из роута). */
export const heroPageOpened = createEvent<string>();

export const fetchHeroByCodeFx = createEffect(async (code: string): Promise<HeroClass> => {
	return fetchHeroByCode(code);
});

export const $hero = createStore<HeroClass | null>(null)
	.on(heroPageOpened, () => null)
	.on(fetchHeroByCodeFx.doneData, (_, hero) => hero);

export const $heroPending = fetchHeroByCodeFx.pending;

export const $heroError = createStore<string | null>(null)
	.on(heroPageOpened, () => null)
	.on(fetchHeroByCodeFx.failData, (_, error) => toErrorMessage(error));

sample({
	clock: heroPageOpened,
	target: fetchHeroByCodeFx,
});
