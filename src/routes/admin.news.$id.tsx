import { createFileRoute } from '@tanstack/react-router';

import { AdminNewsFormPage } from '@/pages/AdminNews';

export const Route = createFileRoute('/admin/news/$id')({
	component: () => <AdminNewsFormPage mode="edit" />,
});
