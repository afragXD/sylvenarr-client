import { isRedirect, redirect } from '@tanstack/react-router';

import { fetchCurrentPlayer } from '@/entities/player';

import { isStaffRole } from './staffRole';

/**
 * beforeLoad: admin или creator, иначе на главную.
 * Неавторизованных — на вход.
 */
export async function requireAdmin(): Promise<void> {
	try {
		const player = await fetchCurrentPlayer();
		if (!player) {
			throw redirect({ to: '/sign-in' });
		}
		if (!isStaffRole(player.role)) {
			throw redirect({ to: '/' });
		}
	} catch (error) {
		// redirect() — это Response с options.to, не объект с полем `to`
		if (isRedirect(error)) {
			throw error;
		}
		throw redirect({ to: '/sign-in' });
	}
}
