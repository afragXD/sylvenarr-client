import { createFileRoute, Outlet } from '@tanstack/react-router';

import { requireCreator } from '@/shared/lib/requireCreator';

export const Route = createFileRoute('/creator/matches')({
	ssr: false,
	beforeLoad: requireCreator,
	component: () => <Outlet />,
});
