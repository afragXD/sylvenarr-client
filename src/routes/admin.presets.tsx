import { createFileRoute } from '@tanstack/react-router';

import { AdminPresetsPage } from '@/pages/AdminPresets';
import { absoluteUrl } from '@/shared/constants';
import { requireAdmin } from '@/shared/lib/requireAdmin';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/admin/presets')({
	beforeLoad: requireAdmin,
	head: () => ({
		meta: seo({
			title: 'Пресеты отряда',
			description: 'Управление глобальными пресетами',
			url: absoluteUrl('/admin/presets'),
			noIndex: true,
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/admin/presets') }],
	}),
	component: AdminPresetsPage,
});
