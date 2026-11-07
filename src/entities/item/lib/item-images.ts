import { STATIC_BASE_URL } from '@/shared/constants';

/**
 * URL иконки предмета через Angie:
 * `{VITE_STATIC_BASE_URL}/static/images/items/{code}.webp`
 */
export function getItemIconUrl(code: number): string {
	return `${STATIC_BASE_URL}/static/images/items/${code}.webp`;
}
