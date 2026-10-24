import { createFileRoute } from '@tanstack/react-router';

import { ProfilePresetsPage } from '@/pages/Profile';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/profile/presets')({
	head: () => ({
		meta: seo({
			title: 'Пресеты отряда',
			description: 'Личные и глобальные составы для лобби',
			url: absoluteUrl('/profile/presets'),
			noIndex: true,
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/profile/presets') }],
	}),
	component: ProfilePresetsPage,
});
