import { createFileRoute } from '@tanstack/react-router';

import { MatchRoomPage } from '@/pages/MatchRoom';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/lobby/$matchId')({
	head: ({ params }) => ({
		meta: seo({
			title: 'Матч',
			description: 'Набор отряда и лобби матча Sylvenarr',
			url: absoluteUrl(`/lobby/${params.matchId}`),
			noIndex: true,
		}),
		links: [{ rel: 'canonical', href: absoluteUrl(`/lobby/${params.matchId}`) }],
	}),
	component: MatchRoomPage,
});
