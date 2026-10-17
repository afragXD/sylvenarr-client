import { createFileRoute, redirect } from '@tanstack/react-router';

import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/sign-up')({
	beforeLoad: () => {
		throw redirect({ to: '/sign-in' });
	},
	head: () => ({
		meta: seo({
			title: 'Регистрация',
			description: 'Регистрация в Sylvenarr',
			url: absoluteUrl('/sign-up'),
			noIndex: true,
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/sign-up') }],
	}),
});
