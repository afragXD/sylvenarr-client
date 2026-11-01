import { createFileRoute } from '@tanstack/react-router';

import { LobbyPage } from '@/pages/Lobby';
import { absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo/seo';

type LobbySearch = {
	/** Код приглашения для авто-входа (AC-7). */
	code?: string;
};

const sanitizeInviteCode = (raw: unknown): string | undefined => {
	if (typeof raw !== 'string') {
		return undefined;
	}
	const code = raw
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, '')
		.slice(0, 6);
	return code.length > 0 ? code : undefined;
};

export const Route = createFileRoute('/lobby/')({
	validateSearch: (search: Record<string, unknown>): LobbySearch => ({
		code: sanitizeInviteCode(search.code),
	}),
	head: () => ({
		meta: seo({
			title: 'Лобби',
			description: 'Создание и вход в матч Sylvenarr',
			url: absoluteUrl('/lobby'),
			noIndex: true,
		}),
		links: [{ rel: 'canonical', href: absoluteUrl('/lobby') }],
	}),
	component: LobbyPage,
});
