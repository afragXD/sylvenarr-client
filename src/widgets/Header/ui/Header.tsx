import { Avatar, Group, Menu, Stack, Text, UnstyledButton } from '@mantine/core';
import { useWindowScroll } from '@mantine/hooks';
import { Link } from '@tanstack/react-router';
import { useUnit } from 'effector-react';
import { LogOut, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { $player, $sessionChecked, logoutFx, sessionRequested } from '@/entities/player';
import { APP_TITLE } from '@/shared/constants';
import { takeAuthRedirect } from '@/shared/lib/authRedirect';
import { isStaffRole } from '@/shared/lib/staffRole';
import { resolveStaticUrl } from '@/shared/lib/staticUrl';
import { RuneGateIcon } from '@/shared/ui/BrandMark';
import { OrnateLink } from '@/shared/ui/OrnateButton';
import { SiteMenu } from '@/widgets/SiteMenu';

import classes from './Header.module.css';

const PRIMARY_NAV = [
	{ to: '/heroes', label: 'Герои' },
	{ to: '/lobby', label: 'Лобби' },
	{ to: '/rating', label: 'Рейтинг' },
	{ to: '/news', label: 'Новости' },
] as const;

const initialsFromName = (name: string): string => {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) {
		return '?';
	}
	if (parts.length === 1) {
		return parts[0].slice(0, 2).toUpperCase();
	}
	return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
};

export const Header = () => {
	const player = useUnit($player);
	const sessionChecked = useUnit($sessionChecked);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [scroll] = useWindowScroll();
	const compact = scroll.y > 80;

	useEffect(() => {
		sessionRequested();
	}, []);

	/** После OAuth приземление на FRONTEND_URL — вернуть на сохранённую ссылку матча. */
	useEffect(() => {
		if (!player) {
			return;
		}
		const redirect = takeAuthRedirect();
		if (!redirect) {
			return;
		}
		const here = `${window.location.pathname}${window.location.search}`;
		if (redirect === here) {
			return;
		}
		window.location.assign(redirect);
	}, [player]);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await logoutFx();
		} catch {
			/* ignore */
		} finally {
			setIsLoggingOut(false);
		}
	};

	const playTo = player ? '/lobby' : '/sign-in';
	const playLabel = player ? 'В лобби' : 'Войти и играть';
	const showPlayCta = sessionChecked;
	const avatarSrc = resolveStaticUrl(player?.avatarUrl) ?? player?.avatarUrl ?? undefined;

	return (
		<>
			<div className={classes.header}>
				<div className={classes.inner}>
					<div className={classes.left}>
						<Link
							to="/"
							className={[classes.brand, compact ? classes.brandCompact : null]
								.filter(Boolean)
								.join(' ')}
							aria-label={APP_TITLE}
						>
							<span className={classes.mark} aria-hidden>
								<RuneGateIcon size={compact ? 32 : 40} />
							</span>
							{!compact ? <span className={classes.wordmark}>{APP_TITLE}</span> : null}
						</Link>
						<nav className={classes.nav} aria-label="Основная навигация">
							{PRIMARY_NAV.map((item) => (
								<Link key={item.to} to={item.to} className={classes.navLink}>
									{item.label}
								</Link>
							))}
						</nav>
					</div>

					<div className={classes.right}>
						{showPlayCta ? (
							<OrnateLink to={playTo} variant="parchment" size="sm" withDiamonds={false}>
								{playLabel}
							</OrnateLink>
						) : null}
						{player ? (
							<Menu shadow="md" width={240} position="bottom-end" radius={0}>
								<Menu.Target>
									<UnstyledButton aria-label="Меню аккаунта" className={classes.accountBtn}>
										<Avatar
											src={avatarSrc}
											alt=""
											radius="xl"
											size={36}
											color="brand"
										>
											{initialsFromName(player.displayName)}
										</Avatar>
										<span className={classes.accountName}>
											{player.displayName}
											<span className={classes.accountCaret} aria-hidden>
												▾
											</span>
										</span>
									</UnstyledButton>
								</Menu.Target>
								<Menu.Dropdown className={classes.menu}>
									<Menu.Item component={Link} to="/profile/dossier">
										<Group gap="sm" wrap="nowrap" align="flex-start">
											<Avatar src={avatarSrc} alt="" radius="xl" size={32} color="brand">
												{initialsFromName(player.displayName)}
											</Avatar>
											<Stack gap={2} style={{ minWidth: 0 }}>
												<Text size="sm" fw={600} c="var(--app-text)" lineClamp={1}>
													{player.displayName}
												</Text>
												{player.email ? (
													<Text size="xs" c="var(--app-text-muted)" lineClamp={1}>
														{player.email}
													</Text>
												) : null}
											</Stack>
										</Group>
									</Menu.Item>
									<Menu.Divider />
									<Menu.Item component={Link} to="/profile/dossier">
										Досье
									</Menu.Item>
									<Menu.Item component={Link} to="/matches">
										Мои матчи
									</Menu.Item>
									<Menu.Item component={Link} to="/profile/presets">
										Пресеты
									</Menu.Item>
									<Menu.Item component={Link} to="/profile/settings">
										Настройки
									</Menu.Item>
									{isStaffRole(player.role) ? (
										<Menu.Item component={Link} to="/admin/news">
											Новости (админ)
										</Menu.Item>
									) : null}
									<Menu.Divider />
									<Menu.Item
										className={classes.logoutItem}
										leftSection={<LogOut size={14} />}
										disabled={isLoggingOut}
										onClick={() => void handleLogout()}
									>
										Выйти
									</Menu.Item>
								</Menu.Dropdown>
							</Menu>
						) : null}
						<button
							type="button"
							className={[classes.burger, menuOpen ? classes.burgerOpen : null]
								.filter(Boolean)
								.join(' ')}
							aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
							aria-expanded={menuOpen}
							onClick={() => setMenuOpen((open) => !open)}
						>
							{menuOpen ? (
								<X size={18} aria-hidden />
							) : (
								<>
									<span />
									<span />
									<span />
								</>
							)}
						</button>
					</div>
				</div>
			</div>
			<SiteMenu
				opened={menuOpen}
				onClose={() => setMenuOpen(false)}
				isAdmin={isStaffRole(player?.role)}
				isSignedIn={Boolean(player)}
				sessionChecked={sessionChecked}
				displayName={player?.displayName}
				onLogout={() => void handleLogout()}
				isLoggingOut={isLoggingOut}
			/>
		</>
	);
};
