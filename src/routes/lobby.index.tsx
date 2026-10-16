import { createFileRoute } from '@tanstack/react-router';

import { LobbyPage } from '@/pages/Lobby';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/lobby/')({
	head: () => ({
		meta: seo({
			title: 'Лобби',
			description: 'Создание и вход в матч Sylvenarr',
			url: absoluteUrl('/lobby'),
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/lobby') }],
	}),
	component: LobbyPage,
});
