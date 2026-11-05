import { createFileRoute } from '@tanstack/react-router';

import { CreatorMatchesListPage } from '@/pages/CreatorMatches';

export const Route = createFileRoute('/creator/matches/')({
	component: CreatorMatchesListPage,
});
