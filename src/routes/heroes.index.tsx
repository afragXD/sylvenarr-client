import { createFileRoute } from '@tanstack/react-router';

import { HeroesPage } from '@/pages/Heroes';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/heroes/')({
	head: () => ({
		meta: seo({
			title: 'Герои',
			description: 'Каталог классов Sylvenarr: Origins',
			url: absoluteUrl('/heroes'),
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/heroes') }],
	}),
	component: HeroesPage,
});
