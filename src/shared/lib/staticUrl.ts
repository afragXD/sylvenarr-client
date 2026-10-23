import { STATIC_BASE_URL } from '@/shared/constants';

/**
 * Абсолютный URL ассета с volume Angie (`VITE_STATIC_BASE_URL`).
 * - `https://…` — без изменений
 * - `/static/…` — origin + путь
 * - `/scenes/…` — legacy public → `/static/images/scenes/…`
 * - `scenes/…` — то же без ведущего `/`
 */
export function resolveStaticUrl(path: string | null | undefined): string | null {
	if (!path) {
		return null;
	}
	const trimmed = path.trim();
	if (!trimmed) {
		return null;
	}
	if (/^https?:\/\//i.test(trimmed)) {
		return trimmed;
	}
	if (trimmed.startsWith('/static/')) {
		return `${STATIC_BASE_URL}${trimmed}`;
	}
	if (trimmed.startsWith('/scenes/')) {
		return `${STATIC_BASE_URL}/static/images${trimmed}`;
	}
	if (trimmed.startsWith('scenes/')) {
		return `${STATIC_BASE_URL}/static/images/${trimmed}`;
	}
	if (trimmed.startsWith('static/')) {
		return `${STATIC_BASE_URL}/${trimmed}`;
	}
	return trimmed;
}

/**
 * URL скрина из volume: `{STATIC}/static/images/scenes/{fileName}`.
 */
export function getSceneUrl(fileName: string): string {
	const name = fileName.replace(/^\/+/, '').replace(/^scenes\//, '');
	return `${STATIC_BASE_URL}/static/images/scenes/${name}`;
}
