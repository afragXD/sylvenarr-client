import { redirect } from '@tanstack/react-router';

import { fetchCurrentPlayer } from '@/entities/player';

/**
 * beforeLoad: только admin, иначе на главную.
 */
export async function requireAdmin(): Promise<void> {
	try {
		const player = await fetchCurrentPlayer();
		if (player.role !== 'admin') {
			throw redirect({ to: '/' });
		}
	} catch (error) {
		if (error && typeof error === 'object' && 'to' in error) {
			throw error;
		}
		throw redirect({ to: '/sign-in' });
	}
}
