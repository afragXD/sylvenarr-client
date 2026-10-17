import { createFileRoute } from '@tanstack/react-router';

import { EffectsCodexPage } from '@/pages/EffectsCodex';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

export const Route = createFileRoute('/heroes/effects')({
	head: () => ({
		meta: seo({
			title: 'Кодекс эффектов',
			description:
				'Справочник боевых эффектов Sylvenarr: Origins — баффы, дебаффы и статусные состояния.',
			url: absoluteUrl('/heroes/effects'),
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/heroes/effects') }],
	}),
	component: EffectsCodexPage,
});
