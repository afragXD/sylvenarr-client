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
	presets: {
		title: 'Пресеты отряда',
		lead: 'Готовые составы для лобби',
	},
};

const metaForPath = (pathname: string) => {
	if (pathname.startsWith('/profile/dossier')) {
		return SECTION_META.dossier;
	}
	if (pathname.startsWith('/profile/presets')) {
		return SECTION_META.presets;
	}
	return SECTION_META.settings;
};

/**
 * Каркас профиля: боковая навигация на десктопе, две кнопки на мобилке.
 */
export const ProfileShell = () => {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const meta = metaForPath(pathname);

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
