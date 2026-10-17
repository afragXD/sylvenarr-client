import { createFileRoute } from '@tanstack/react-router';

import { MatchHistoryDetailPage } from '@/pages/MatchHistory';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/matches/$matchId')({
	head: ({ params }) => ({
		meta: seo({
			title: 'Матч',
			description: 'Подробности завершённого матча',
			url: absoluteUrl(`/matches/${params.matchId}`),
			noIndex: true,
		}),
		links: [{ rel: 'canonical', href: absoluteUrl(`/matches/${params.matchId}`) }],
	}),
	component: MatchHistoryDetailPage,
});
