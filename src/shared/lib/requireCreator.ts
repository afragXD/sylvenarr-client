import { isRedirect, redirect } from '@tanstack/react-router';

import { fetchCurrentPlayer } from '@/entities/player';

import { isCreatorRole } from './staffRole';

/**
 * beforeLoad: только creator, иначе на главную.
 * Неавторизованных — на вход.
 */
export async function requireCreator(): Promise<void> {
	try {
		const player = await fetchCurrentPlayer();
		if (!player) {
			throw redirect({ to: '/sign-in' });
		}
		if (!isCreatorRole(player.role)) {
			throw redirect({ to: '/' });
		}
	} catch (error) {
		if (isRedirect(error)) {
			throw error;
		}
		throw redirect({ to: '/sign-in' });
	}
}
