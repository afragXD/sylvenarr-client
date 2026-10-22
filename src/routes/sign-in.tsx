import { createFileRoute } from '@tanstack/react-router';

import { SignInPage } from '@/pages/SignIn';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

type SignInSearch = {
	auth?: 'error';
	reason?: string;
};

export const Route = createFileRoute('/sign-in')({
	validateSearch: (search: Record<string, unknown>): SignInSearch => ({
		auth: search.auth === 'error' ? 'error' : undefined,
		reason: typeof search.reason === 'string' ? search.reason : undefined,
	}),
	head: () => ({
		meta: seo({
			title: 'Войти',
			description: 'Вход в Sylvenarr по логину, почте или через OAuth',
			url: absoluteUrl('/sign-in'),
			noIndex: true,
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/sign-in') }],
	}),
	component: SignInPage,
});
