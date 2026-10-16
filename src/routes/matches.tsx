import { createFileRoute } from '@tanstack/react-router';

import { MatchHistoryPage } from '@/pages/MatchHistory';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/matches')({
	head: () => ({
		meta: seo({
			title: 'Мои матчи',
			description: 'История завершённых матчей',
			url: absoluteUrl('/matches'),
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/matches') }],
	}),
	component: MatchHistoryPage,
});
