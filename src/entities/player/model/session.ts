import { createEffect, createEvent, createStore, sample } from 'effector';

import { fetchCurrentPlayer, logoutPlayer } from '../api/playersApi';
import type { Player } from './types';

/** Запросить текущую сессию (хедер, вход). */
export const sessionRequested = createEvent();

/** Локально подставить игрока после PATCH/upload аватара. */
export const playerUpdated = createEvent<Player>();

export const fetchSessionFx = createEffect(async (): Promise<Player> => {
	return fetchCurrentPlayer();
});

export const logoutFx = createEffect(async (): Promise<void> => {
	await logoutPlayer();
});

export const $player = createStore<Player | null>(null)
	.on(fetchSessionFx.doneData, (_, player) => player)
	.on(playerUpdated, (_, player) => player)
	.on(fetchSessionFx.fail, () => null)
	.reset(logoutFx.done);

sample({
	clock: sessionRequested,
	target: fetchSessionFx,
});
