import { SITE_URL } from '@/shared/constants';

const STORAGE_KEY = 'sylvenarr.authRedirect';

/** Путь с одной «/», без // и /\ сразу после. */
const PATH_OK = /^\/(?![/\\])/;

const appOrigin = (): string => {
	if (typeof window !== 'undefined' && window.location?.origin) {
		return window.location.origin;
	}
	return SITE_URL.replace(/\/$/, '');
};

const decodeFully = (path: string): string | null => {
	let value = path;
	try {
		for (let i = 0; i < 3; i += 1) {
			const next = decodeURIComponent(value);
			if (next === value) {
				break;
			}
			value = next;
		}
		return value;
	} catch {
		return null;
	}
};

/**
 * Same-origin путь: ^/(?![/\\]) и URL(…).origin === location.origin.
 * Режет /\example.com, //evil, https://…, javascript:, %2F%5C… .
 */
export function isSafeAppPath(path: string): boolean {
	if (typeof path !== 'string' || path.length === 0 || path.length > 2048) {
		return false;
	}
	const value = decodeFully(path);
	if (value === null) {
		return false;
	}
	if (!PATH_OK.test(value) || value.includes('\\')) {
		return false;
	}
	for (let i = 0; i < value.length; i += 1) {
		if (value.charCodeAt(i) < 32) {
			return false;
		}
	}
	try {
		const origin = appOrigin();
		const resolved = new URL(value, origin);
		if (resolved.origin !== new URL(origin).origin) {
			return false;
		}
		if (!PATH_OK.test(resolved.pathname) || resolved.pathname.includes('\\')) {
			return false;
		}
		return true;
	} catch {
		return false;
	}
}

/** Нормализованный путь или «/», если вход небезопасен. */
export function sanitizeAuthRedirect(path: string): string {
	if (!isSafeAppPath(path)) {
		return '/';
	}
	const value = decodeFully(path);
	if (value === null) {
		return '/';
	}
	try {
		const resolved = new URL(value, appOrigin());
		return `${resolved.pathname}${resolved.search}${resolved.hash}`;
	} catch {
		return '/';
	}
}

/** Запомнить куда вернуться после входа; небезопасное → «/». */
export function setAuthRedirect(path: string): void {
	try {
		window.sessionStorage.setItem(STORAGE_KEY, sanitizeAuthRedirect(path));
	} catch {
		/* sessionStorage недоступен */
	}
}

/**
 * Прочитать и сразу снять redirect.
 * null — не было записи; иначе безопасный путь (битая запись → «/»).
 */
export function takeAuthRedirect(): string | null {
	try {
		const value = window.sessionStorage.getItem(STORAGE_KEY);
		window.sessionStorage.removeItem(STORAGE_KEY);
		if (typeof value !== 'string' || value.length === 0) {
			return null;
		}
		return sanitizeAuthRedirect(value);
	} catch {
		return null;
	}
}
