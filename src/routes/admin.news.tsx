import { createFileRoute, Outlet } from '@tanstack/react-router';

import { requireAdmin } from '@/shared/lib/requireAdmin';

export const Route = createFileRoute('/admin/news')({
	beforeLoad: requireAdmin,
	component: () => <Outlet />,
});
