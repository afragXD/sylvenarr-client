import { createFileRoute } from '@tanstack/react-router';

import { PopularHeroesPage } from '@/pages/PopularHeroes';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/heroes/popular')({
	head: () => ({
		meta: seo({
			title: 'Популярные герои',
			description: 'Кого чаще всего берут в отряд на арене Sylvenarr: Origins.',
			url: absoluteUrl('/heroes/popular'),
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/heroes/popular') }],
	}),
	component: PopularHeroesPage,
});
