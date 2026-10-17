import { createFileRoute } from '@tanstack/react-router';

import { fetchHeroByCode, getHeroPortraitUrl } from '@/entities/hero';
import { HeroDetailPage } from '@/pages/HeroDetail';
import { absoluteUrl } from '@/shared/constants';
import { breadcrumbJsonLd, heroJsonLd, seo } from '@/shared/lib/seo';

export const Route = createFileRoute('/heroes/$code')({
	loader: ({ params }) => fetchHeroByCode(params.code),
	head: ({ loaderData, params }) => {
		const title = loaderData?.displayName ?? params.code;
		const description =
			loaderData?.description?.trim() ||
			loaderData?.roleSummary?.trim() ||
			`Карточка героя ${title} в Sylvenarr: Origins — способности, роль и портрет.`;
		const url = absoluteUrl(`/heroes/${params.code}`);
		const image = getHeroPortraitUrl(params.code);

		return {
			meta: seo({
				title,
				description,
				url,
				image,
			}),
			links: [{ rel: 'canonical', href: url }],
			scripts: [
				heroJsonLd({ name: title, description, url, image }),
				breadcrumbJsonLd([
					{ name: 'Главная', url: absoluteUrl('/') },
					{ name: 'Герои', url: absoluteUrl('/heroes') },
					{ name: title, url },
				]),
			],
		};
	},
	component: HeroDetailPage,
});
