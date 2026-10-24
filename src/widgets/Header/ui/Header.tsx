import { Avatar, Group, Menu, Stack, Text, UnstyledButton } from '@mantine/core';
import { useWindowScroll } from '@mantine/hooks';
import { Link } from '@tanstack/react-router';
import { useUnit } from 'effector-react';
import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

import { $player, logoutFx, sessionRequested } from '@/entities/player';
import { APP_TITLE } from '@/shared/constants';
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
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [scroll] = useWindowScroll();
	const compact = scroll.y > 80;

	useEffect(() => {
		sessionRequested();
	}, []);

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
						<OrnateLink to={playTo} variant="parchment" size="sm" withDiamonds={false}>
							Играть
						</OrnateLink>
						{player ? (
							<Menu shadow="md" width={240} position="bottom-end" radius={0}>
								<Menu.Target>
									<UnstyledButton aria-label="Меню аккаунта" className={classes.avatar}>
										<Avatar
											src={avatarSrc}
											alt={player.displayName}
											radius="xl"
											size={36}
											color="brand"
										>
											{initialsFromName(player.displayName)}
										</Avatar>
									</UnstyledButton>
								</Menu.Target>
								<Menu.Dropdown className={classes.menu}>
									<Menu.Item component={Link} to="/profile/settings">
										<Group gap="sm" wrap="nowrap" align="flex-start">
											<Avatar
												src={avatarSrc}
												alt=""
												radius="xl"
												size={32}
												color="brand"
											>
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
									<Menu.Item component={Link} to="/profile/presets">
										Пресеты
									</Menu.Item>
									<Menu.Item component={Link} to="/profile/settings">
										Настройки
									</Menu.Item>
									<Menu.Item component={Link} to="/matches">
										Мои матчи
									</Menu.Item>
									<Menu.Item component={Link} to="/lobby">
										Лобби
									</Menu.Item>
									<Menu.Item component={Link} to="/rating">
										Рейтинг
									</Menu.Item>
									{player.role === 'admin' ? (
										<Menu.Item component={Link} to="/admin/news">
											Управление новостями
										</Menu.Item>
									) : null}
									<Menu.Divider />
									<Menu.Item
										color="red"
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
							className={classes.burger}
							aria-label="Открыть меню"
							aria-expanded={menuOpen}
							onClick={() => setMenuOpen(true)}
						>
							<span />
							<span />
							<span />
						</button>
					</div>
				</div>
			</div>
			<SiteMenu
				opened={menuOpen}
				onClose={() => setMenuOpen(false)}
				isAdmin={player?.role === 'admin'}
			/>
		</>
	);
};
