const STORAGE_KEY = 'sylvenarr.authRedirect';

/**
 * Только внутренние пути приложения (без open redirect).
 */
export function isSafeAppPath(path: string): boolean {
	return path.startsWith('/') && !path.startsWith('//') && !path.includes('://');
}

/** Запомнить куда вернуться после входа (пароль или Яндекс). */
export function setAuthRedirect(path: string): void {
	if (!isSafeAppPath(path)) {
		return;
	}
	try {
		window.sessionStorage.setItem(STORAGE_KEY, path);
	} catch {
		/* sessionStorage недоступен */
	}
}

/** Прочитать и сразу снять redirect. */
export function takeAuthRedirect(): string | null {
	try {
		const value = window.sessionStorage.getItem(STORAGE_KEY);
		window.sessionStorage.removeItem(STORAGE_KEY);
		if (typeof value === 'string' && isSafeAppPath(value)) {
			return value;
		}
	} catch {
		/* ignore */
	}
	return null;
}
