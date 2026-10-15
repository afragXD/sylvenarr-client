import { createFileRoute } from '@tanstack/react-router';

import { SignUpPage } from '@/pages/SignUp';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/sign-up')({
	head: () => ({
		meta: seo({
			title: 'Создать аккаунт',
			description: 'Регистрация в Sylvenarr: Origins',
			url: absoluteUrl('/sign-up'),
			noIndex: true,
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/sign-up') }],
	}),
	component: SignUpPage,
});
