import { createFileRoute } from '@tanstack/react-router';

import { NewsDetailPage } from '@/pages/News';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo';

export const Route = createFileRoute('/news/$slug')({
	head: ({ params }) => {
		const url = absoluteUrl(`/news/${params.slug}`);
		return {
			meta: seo({
				title: 'Новость',
				description: 'Запись хроники разработки Sylvenarr.',
				url,
				type: 'article',
			}),
			links: [{ rel: 'canonical', href: url }],
		};
	},
	component: NewsDetailPage,
});
