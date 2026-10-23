import { createFileRoute } from '@tanstack/react-router';

import { ProfileDossierPage } from '@/pages/Profile';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/profile/')({
	head: () => ({
		meta: seo({
			title: 'Досье',
			description: 'Герои, которых вы берёте чаще всего',
			url: absoluteUrl('/profile'),
			noIndex: true,
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/profile') }],
	}),
	component: ProfileDossierPage,
});
