import { createFileRoute } from '@tanstack/react-router';

import { ProfileShell } from '@/pages/Profile';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/profile')({
	head: () => ({
		meta: seo({
			title: 'Профиль',
			description: 'Досье и настройки аккаунта',
			url: absoluteUrl('/profile/settings'),
			noIndex: true,
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/profile/settings') }],
	}),
	component: ProfileShell,
});
