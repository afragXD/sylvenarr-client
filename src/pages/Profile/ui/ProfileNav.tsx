import { Link, useRouterState } from '@tanstack/react-router';

import classes from './ProfileShell.module.css';

const LINKS = [
	{ to: '/profile/settings' as const, label: 'Настройки' },
	{ to: '/profile/dossier' as const, label: 'Досье' },
	{ to: '/profile/presets' as const, label: 'Пресеты' },
];

/**
 * Навигация профиля: колонка слева на десктопе, две кнопки на мобилке.
 */
export const ProfileNav = () => {
	const pathname = useRouterState({ select: (state) => state.location.pathname });

	return (
		<nav className={classes.sideNav} aria-label="Разделы профиля">
			{LINKS.map((link) => {
				const active = pathname.startsWith(link.to);
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
