import { createFileRoute } from '@tanstack/react-router';

import { HomePage } from '@/pages/Home';
import { APP_DESCRIPTION, absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo';

const homeUrl = absoluteUrl('/');

export const Route = createFileRoute('/')({
	head: () => ({
		meta: seo({
			title: 'Sylvenarr',
			description: APP_DESCRIPTION,
			url: homeUrl,
		}),
		links: [{ rel: 'canonical', href: homeUrl }],
	}),
	component: HomePage,
});
