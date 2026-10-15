import { createFileRoute } from '@tanstack/react-router';

import { SignInPage } from '@/pages/SignIn';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/sign-in')({
	head: () => ({
		meta: seo({
			title: 'Войти',
			description: 'Вход в аккаунт Sylvenarr: Origins',
			url: absoluteUrl('/sign-in'),
			noIndex: true,
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/sign-in') }],
	}),
	component: SignInPage,
});
