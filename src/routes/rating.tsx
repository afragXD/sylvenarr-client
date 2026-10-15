import { createFileRoute } from '@tanstack/react-router';

import { RatingPage } from '@/pages/Rating';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/rating')({
	head: () => ({
		meta: seo({
			title: 'Рейтинг',
			description: 'Таблица рейтинга игроков Sylvenarr',
			url: absoluteUrl('/rating'),
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/rating') }],
	}),
	component: RatingPage,
});
