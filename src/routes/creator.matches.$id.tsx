import { createFileRoute } from '@tanstack/react-router';

import { CreatorMatchEditPage } from '@/pages/CreatorMatches';

export const Route = createFileRoute('/creator/matches/$id')({
	component: CreatorMatchEditPage,
});
