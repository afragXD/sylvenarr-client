import { Link, useRouterState } from '@tanstack/react-router';

import classes from './ProfileShell.module.css';

const LINKS = [
	{ to: '/profile/settings' as const, label: 'Настройки', match: 'settings' as const },
	{ to: '/profile' as const, label: 'Досье', match: 'dossier' as const },
];

/**
 * Навигация профиля: колонка слева на десктопе, две кнопки на мобилке.
 */
export const ProfileNav = () => {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const isSettings = pathname.startsWith('/profile/settings');

	return (
		<nav className={classes.sideNav} aria-label="Разделы профиля">
			{LINKS.map((link) => {
				const active = link.match === 'settings' ? isSettings : !isSettings;
				return (
					<Link
						key={link.to}
						to={link.to}
						className={[classes.link, active ? classes.linkActive : null]
							.filter(Boolean)
							.join(' ')}
						aria-current={active ? 'page' : undefined}
					>
						{link.label}
					</Link>
				);
			})}
		</nav>
	);
};
