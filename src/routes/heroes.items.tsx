import { createFileRoute } from '@tanstack/react-router';

import { ItemsCodexPage } from '@/pages/ItemsCodex';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/heroes/items')({
	head: () => ({
		meta: seo({
			title: 'Кодекс предметов',
			description:
				'Справочник предметов Sylvenarr: Origins — каталог ярмарки, категории, тиры и цели.',
			url: absoluteUrl('/heroes/items'),
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/heroes/items') }],
	}),
	component: ItemsCodexPage,
});
