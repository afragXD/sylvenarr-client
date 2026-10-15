export const APP_TITLE = 'Sylvenarr' as const;

export const APP_DESCRIPTION = 'Клиентское приложение Sylvenarr.' as const;

export const APP_KEYWORDS = 'sylvenarr' as const;

/** Публичный origin сайта (без завершающего `/`). */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'http://localhost:3000').replace(
	/\/$/,
	'',
);

export const absoluteUrl = (path = '/'): string => {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${SITE_URL}${normalized === '/' ? '/' : normalized}`;
};

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL;
