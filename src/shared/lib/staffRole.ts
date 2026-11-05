import type { PlayerRole } from '@/entities/player';

/**
 * Роли с полным админ-доступом на клиенте (меню, /admin/news, глобальные пресеты).
 * Сейчас admin и creator равноправны.
 */
export function isStaffRole(role: PlayerRole | string | null | undefined): boolean {
	return role === 'admin' || role === 'creator';
}

/** Только creator (редактор живых матчей). */
export function isCreatorRole(role: PlayerRole | string | null | undefined): boolean {
	return role === 'creator';
}
