import { createFileRoute } from '@tanstack/react-router';

import { fetchHeroes } from '@/entities/hero/api/heroesApi';
import { fetchNewsList } from '@/entities/news';
import { absoluteUrl } from '@/shared/constants';

const STATIC_PATHS = ['/', '/heroes', '/heroes/effects', '/rating', '/privacy', '/news'] as const;

const escapeXml = (value: string): string =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');

const urlEntry = (loc: string, priority: string): string => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;

export const Route = createFileRoute('/sitemap.xml')({
	server: {
		handlers: {
			GET: async () => {
				const staticEntries = STATIC_PATHS.map((path) =>
					urlEntry(absoluteUrl(path), path === '/' ? '1.0' : '0.8'),
				);

				let heroEntries: string[] = [];
				try {
					const heroes = await fetchHeroes();
					heroEntries = heroes.map((hero) => urlEntry(absoluteUrl(`/heroes/${hero.code}`), '0.7'));
				} catch {
					// Sitemap still useful without dynamic hero URLs if API is down.
				}

				let newsEntries: string[] = [];
				try {
					const news = await fetchNewsList({ limit: 50 });
					newsEntries = news.items.map((item) =>
						urlEntry(absoluteUrl(`/news/${item.slug}`), '0.6'),
					);
				} catch {
					// ignore
				}

				const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...heroEntries, ...newsEntries].join('\n')}
</urlset>
`;

				return new Response(body, {
					headers: {
						'Content-Type': 'application/xml; charset=utf-8',
						'Cache-Control': 'public, max-age=3600',
					},
				});
			},
		},
	},
});
