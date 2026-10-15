import { STATIC_BASE_URL } from '@/shared/constants';

/**
 * URL ассета героя через Angie:
 * `{VITE_STATIC_BASE_URL}/static/images/heroes/...`
 */
function heroAssetUrl(relativePath: string): string {
	return `${STATIC_BASE_URL}/static/images/heroes/${relativePath}`;
}

/**
 * URL портрета героя.
 */
export function getHeroPortraitUrl(code: string): string {
	return heroAssetUrl(`portraits/${code}.png`);
}

/**
 * URL спрайта героя.
 */
export function getHeroCharacterUrl(code: string): string {
	return heroAssetUrl(`characters/${code}.png`);
}

/**
 * Fallback-портрет, если файла нет.
 */
export function getHeroDefaultPortraitUrl(): string {
	return heroAssetUrl('portraits/DEFAULT.png');
}
