import { createFileRoute, notFound } from '@tanstack/react-router';

import { NotFoundPage } from '@/pages/NotFound';

export const Route = createFileRoute('/me')({
	beforeLoad: () => {
		throw notFound();
	},
	component: NotFoundPage,
});
