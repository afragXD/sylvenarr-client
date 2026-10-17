import {
	APP_AUTHORS,
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

export const OG_IMAGE_PATH = '/og-image.png' as const;
export const OG_IMAGE_WIDTH = 1200 as const;
export const OG_IMAGE_HEIGHT = 630 as const;

const defaultImage = () => absoluteUrl(OG_IMAGE_PATH);

export const seo = ({
	title = APP_TITLE,
	description = APP_DESCRIPTION,
	keywords = APP_KEYWORDS,
	image = defaultImage(),
	url = SITE_URL,
	type = 'website',
	noIndex = false,
}: SeoInput = {}): MetaTag[] => {
	const fullTitle = title === APP_TITLE ? title : `${title} · ${APP_TITLE}`;

	return [
		{ title: fullTitle },
		{ name: 'description', content: description },
		{ name: 'keywords', content: keywords },
		{ name: 'author', content: APP_AUTHORS },
		{ name: 'theme-color', content: '#C4A35A' },
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
		{ property: 'og:image:width', content: String(OG_IMAGE_WIDTH) },
		{ property: 'og:image:height', content: String(OG_IMAGE_HEIGHT) },
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:title', content: fullTitle },
		{ name: 'twitter:description', content: description },
		{ name: 'twitter:image', content: image },
	];
};

type JsonLdScript = {
	type: 'application/ld+json';
	children: string;
};

const jsonLd = (data: Record<string, unknown>): JsonLdScript => ({
	type: 'application/ld+json',
	children: JSON.stringify(data),
});

/** Site-wide Organization + WebSite + WebApplication graph for the document root. */
export const websiteJsonLd = (): JsonLdScript =>
	jsonLd({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Organization',
				'@id': `${SITE_URL}/#organization`,
				name: APP_TITLE,
				url: SITE_URL,
				logo: absoluteUrl('/favicon.svg'),
				image: defaultImage(),
			},
			{
				'@type': 'WebSite',
				'@id': `${SITE_URL}/#website`,
				name: APP_TITLE,
				url: SITE_URL,
				description: APP_DESCRIPTION,
				inLanguage: 'ru-RU',
				publisher: { '@id': `${SITE_URL}/#organization` },
			},
			{
				'@type': 'WebApplication',
				'@id': `${SITE_URL}/#app`,
				name: APP_TITLE,
				url: SITE_URL,
				description: APP_DESCRIPTION,
				applicationCategory: 'GameApplication',
				operatingSystem: 'Web',
				inLanguage: 'ru-RU',
				image: defaultImage(),
				isPartOf: { '@id': `${SITE_URL}/#website` },
			},
		],
	});

export type BreadcrumbItem = {
	name: string;
	url: string;
};

export const breadcrumbJsonLd = (items: BreadcrumbItem[]): JsonLdScript =>
	jsonLd({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	});

export type HeroJsonLdInput = {
	name: string;
	description: string;
	url: string;
	image: string;
};

/** Character-like Thing for a hero detail page. */
export const heroJsonLd = ({ name, description, url, image }: HeroJsonLdInput): JsonLdScript =>
	jsonLd({
		'@context': 'https://schema.org',
		'@type': 'Thing',
		name,
		description,
		url,
		image,
		isPartOf: {
			'@type': 'WebSite',
			name: APP_TITLE,
			url: SITE_URL,
		},
	});
