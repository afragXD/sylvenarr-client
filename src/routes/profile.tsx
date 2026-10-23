import { createFileRoute } from '@tanstack/react-router';

import { ProfilePage } from '@/pages/Profile';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/profile')({
	head: () => ({
		meta: seo({
			title: 'Профиль',
			description: 'Имя и аватар аккаунта',
			url: absoluteUrl('/profile'),
			noIndex: true,
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/profile') }],
	}),
	component: ProfilePage,
});
