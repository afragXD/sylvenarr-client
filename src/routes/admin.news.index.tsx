import { createFileRoute } from '@tanstack/react-router';

import { AdminNewsListPage } from '@/pages/AdminNews';

export const Route = createFileRoute('/admin/news/')({
	component: AdminNewsListPage,
});
