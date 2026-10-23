import { Outlet, useRouterState } from '@tanstack/react-router';

import { PageFrame } from '@/shared/ui/PageFrame';

import { ProfileNav } from './ProfileNav';
import classes from './ProfileShell.module.css';

const SECTION_META: Record<string, { title: string; lead: string }> = {
	settings: {
		title: 'Настройки',
		lead: 'Имя и аватар на сайте',
	},
	dossier: {
		title: 'Досье',
		lead: 'Герои, которых вы берёте чаще всего',
	},
};

/**
 * Каркас профиля: боковая навигация на десктопе, две кнопки на мобилке.
 */
export const ProfileShell = () => {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const isSettings = pathname.startsWith('/profile/settings');
	const meta = isSettings ? SECTION_META.settings : SECTION_META.dossier;

	return (
		<PageFrame title={meta.title} eyebrow="Аккаунт" width="wide" lead={meta.lead}>
			<div className={classes.layout}>
				<aside className={classes.side}>
					<ProfileNav />
				</aside>
				<div className={classes.main}>
					<Outlet />
				</div>
			</div>
		</PageFrame>
	);
};
