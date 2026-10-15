import { createFileRoute } from '@tanstack/react-router';

import { HomePage } from '@/pages/Home';
import { absoluteUrl } from '@/shared/constants';

const homeUrl = absoluteUrl('/');

export const Route = createFileRoute('/')({
	head: () => ({
		links: [{ rel: 'canonical', href: homeUrl }],
	}),
	component: HomePage,
});
