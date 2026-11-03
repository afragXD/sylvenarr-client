import { createFileRoute } from '@tanstack/react-router';

import { PerksCodexPage } from '@/pages/PerksCodex';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/heroes/perks')({
	head: () => ({
		meta: seo({
			title: 'Кодекс перков',
			description:
				'Справочник перков Sylvenarr: Origins — навыки ярмарки и какие предметы они открывают.',
			url: absoluteUrl('/heroes/perks'),
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/heroes/perks') }],
	}),
	component: PerksCodexPage,
});
