import { createFileRoute, Outlet } from '@tanstack/react-router';

import { requireAdmin } from '@/shared/lib/requireAdmin';

export const Route = createFileRoute('/admin/news')({
	// Cookie сессии на api.* — SSR на wormgod.site её не видит и отдаёт 307 → /sign-in
	ssr: false,
	beforeLoad: requireAdmin,
	component: () => <Outlet />,
});
