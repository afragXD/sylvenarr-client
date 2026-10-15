import { createFileRoute } from '@tanstack/react-router';

import { getHeroPortraitUrl } from '@/entities/hero';
import { HeroDetailPage } from '@/pages/HeroDetail';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/heroes/$code')({
	head: ({ params }) => ({
		meta: seo({
			title: params.code,
			description: `Карточка героя ${params.code}`,
			url: absoluteUrl(`/heroes/${params.code}`),
			image: getHeroPortraitUrl(params.code),
		}),
		links: [{ rel: 'canonical', href: absoluteUrl(`/heroes/${params.code}`) }],
	}),
	component: HeroDetailPage,
});
