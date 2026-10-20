import { createFileRoute } from '@tanstack/react-router';

import { NewsListPage } from '@/pages/News';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo';

const url = absoluteUrl('/news');

export const Route = createFileRoute('/news/')({
	head: () => ({
		meta: seo({
			title: 'Новости',
			description: 'Хроника разработки Sylvenarr: обновления, девлоги и анонсы.',
			url,
		}),
		links: [{ rel: 'canonical', href: url }],
	}),
	component: NewsListPage,
});
