import {
	APP_DESCRIPTION,
	APP_KEYWORDS,
	APP_TITLE,
	absoluteUrl,
	SITE_URL,
} from '@/shared/constants';

export type SeoInput = {
	title?: string;
	description?: string;
	keywords?: string;
	image?: string;
	url?: string;
	type?: 'website' | 'article';
	noIndex?: boolean;
};

type MetaTag =
	| { title: string }
	| { name: string; content: string }
	| { property: string; content: string };

export const seo = ({
	title = APP_TITLE,
	description = APP_DESCRIPTION,
	keywords = APP_KEYWORDS,
	image = absoluteUrl('/favicon.svg'),
	url = SITE_URL,
	type = 'website',
	noIndex = false,
}: SeoInput = {}): MetaTag[] => {
	const fullTitle = title === APP_TITLE ? title : `${title} · ${APP_TITLE}`;

	return [
		{ title: fullTitle },
		{ name: 'description', content: description },
		{ name: 'keywords', content: keywords },
		{ name: 'author', content: APP_TITLE },
		{ name: 'theme-color', content: '#2F5F7A' },
		{
			name: 'robots',
			content: noIndex ? 'noindex, nofollow' : 'index, follow',
		},
		{ property: 'og:type', content: type },
		{ property: 'og:site_name', content: APP_TITLE },
		{ property: 'og:locale', content: 'ru_RU' },
		{ property: 'og:title', content: fullTitle },
		{ property: 'og:description', content: description },
		{ property: 'og:url', content: url },
		{ property: 'og:image', content: image },
		{ property: 'og:image:alt', content: fullTitle },
		{ name: 'twitter:card', content: 'summary' },
		{ name: 'twitter:title', content: fullTitle },
		{ name: 'twitter:description', content: description },
		{ name: 'twitter:image', content: image },
	];
};

export const websiteJsonLd = () => ({
	type: 'application/ld+json',
	children: JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: APP_TITLE,
		url: SITE_URL,
		description: APP_DESCRIPTION,
		applicationCategory: 'WebApplication',
		operatingSystem: 'Web',
		inLanguage: 'ru-RU',
		image: absoluteUrl('/favicon.svg'),
	}),
});
