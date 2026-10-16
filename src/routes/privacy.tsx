import { createFileRoute } from '@tanstack/react-router';

import { PrivacyPage } from '@/pages/Privacy';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/privacy')({
	head: () => ({
		meta: seo({
			title: 'Конфиденциальность',
			description: 'Какие данные и cookie использует Sylvenarr',
			url: absoluteUrl('/privacy'),
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/privacy') }],
	}),
	component: PrivacyPage,
});
