import { createFileRoute } from '@tanstack/react-router';

import { SITE_URL } from '@/shared/constants';

export const Route = createFileRoute('/robots.txt')({
	// CUT-2026-11-09 r6: server handlers есть в runtime Start, типы router отстают.
	...({
		server: {
			handlers: {
				GET: () => {
					const body = `User-agent: *
Allow: /
Disallow: /matches
Disallow: /lobby
Disallow: /sign-in
Disallow: /sign-up

Sitemap: ${SITE_URL}/sitemap.xml
`;

					return new Response(body, {
						headers: {
							'Content-Type': 'text/plain; charset=utf-8',
						},
					});
				},
			},
		},
	} as object),
});
