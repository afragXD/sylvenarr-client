import { Group } from '@mantine/core';
import { Link, useRouterState } from '@tanstack/react-router';

const LINKS = [
	{ to: '/profile', label: 'Досье', exact: true },
	{ to: '/profile/settings', label: 'Настройки', exact: false },
] as const;

/**
 * Навигация между разделами профиля.
 */
export const ProfileNav = () => {
	const pathname = useRouterState({ select: (state) => state.location.pathname });

	return (
		<Group gap="md" component="nav" aria-label="Разделы профиля">
			{LINKS.map((link) => {
				const active = link.exact
					? pathname === link.to || pathname === `${link.to}/`
					: pathname.startsWith(link.to);
				return (
					<Link
						key={link.to}
						to={link.to}
						style={{
							color: active ? 'var(--mantine-color-brand-4)' : 'var(--app-text-muted)',
							textDecoration: 'none',
							borderBottom: active
								? '1px solid var(--mantine-color-brand-4)'
								: '1px solid transparent',
							paddingBottom: 2,
							fontSize: '0.95rem',
						}}
					>
						{link.label}
					</Link>
				);
			})}
		</Group>
	);
};
