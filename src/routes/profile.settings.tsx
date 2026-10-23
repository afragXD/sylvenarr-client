import { createFileRoute } from '@tanstack/react-router';

import { ProfileSettingsPage } from '@/pages/Profile';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/profile/settings')({
	head: () => ({
		meta: seo({
			title: 'Настройки',
			description: 'Имя и аватар аккаунта',
			url: absoluteUrl('/profile/settings'),
			noIndex: true,
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/profile/settings') }],
	}),
	component: ProfileSettingsPage,
});
