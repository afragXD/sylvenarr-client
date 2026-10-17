export const APP_TITLE = 'Sylvenarr' as const;

export const APP_DESCRIPTION =
	'Sylvenarr: Origins — пошаговый PvP-арена. Соберите отряд героев, выйдите в драфт и сразитесь с соперником.' as const;

export const APP_KEYWORDS = 'sylvenarr, origins, пошаговый pvp, герои, арена, драфт' as const;

/** Автор веб-версии. */
export const AUTHOR_NAME = 'Wormgod' as const;
export const AUTHOR_GITHUB_URL = 'https://github.com/afragXD' as const;

/** Автор оригинального VK-бота и репозиторий. */
export const ORIGINAL_AUTHOR_NAME = 'enlacroix' as const;
export const ORIGINAL_AUTHOR_URL = 'https://github.com/enlacroix' as const;
export const ORIGINAL_BOT_URL = 'https://github.com/enlacroix/arenamsterbot' as const;

/** Meta author (SEO): веб-версия + оригинал. */
export const APP_AUTHORS = `${AUTHOR_NAME}, ${ORIGINAL_AUTHOR_NAME}` as const;

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

/** Почта оператора для запросов по персональным данным (политика конфиденциальности). */
export const CONTACT_EMAIL: string =
	String(import.meta.env.VITE_CONTACT_EMAIL ?? '').trim() || 'support@wormgod.site';

/** Origin Angie для картинок героев (без завершающего `/`). Из `VITE_STATIC_BASE_URL`. */
export const STATIC_BASE_URL = String(import.meta.env.VITE_STATIC_BASE_URL ?? '').replace(
	/\/$/,
	'',
);

if (!STATIC_BASE_URL) {
	throw new Error('VITE_STATIC_BASE_URL is required');
}

if (!API_BASE_URL) {
	throw new Error('VITE_API_BASE_URL is required');
}
