import { createFileRoute } from '@tanstack/react-router';

import { fetchHeroByCode, getHeroPortraitUrl } from '@/entities/hero';
import { HeroDetailPage } from '@/pages/HeroDetail';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/heroes/$code')({
	loader: ({ params }) => fetchHeroByCode(params.code),
	head: ({ loaderData, params }) => {
		const title = loaderData?.displayName ?? params.code;
		const description =
			loaderData?.description?.trim() ||
			loaderData?.roleSummary?.trim() ||
			`Карточка героя ${title}`;
		return {
			meta: seo({
				title,
				description,
				url: absoluteUrl(`/heroes/${params.code}`),
				image: getHeroPortraitUrl(params.code),
			}),
			links: [{ rel: 'canonical', href: absoluteUrl(`/heroes/${params.code}`) }],
		};
	},
	component: HeroDetailPage,
});
