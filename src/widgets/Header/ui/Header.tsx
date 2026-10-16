import {
	Anchor,
	Avatar,
	Box,
	Button,
	Group,
	Menu,
	Stack,
	Text,
	UnstyledButton,
} from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

import { fetchCurrentPlayer, logoutPlayer, type Player } from '@/entities/player';
import { ThemeToggle } from '@/features/ThemeToggle';
import { BrandMark } from '@/shared/ui/BrandMark';

const navItems = [
	{ to: '/heroes', label: 'Герои' },
	{ to: '/lobby', label: 'Лобби' },
	{ to: '/matches', label: 'Матчи' },
	{ to: '/rating', label: 'Рейтинг' },
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
	const [player, setPlayer] = useState<Player | null>(null);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	useEffect(() => {
		void fetchCurrentPlayer()
			.then(setPlayer)
			.catch(() => {
				setPlayer(null);
			});
	}, []);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await logoutPlayer();
			setPlayer(null);
		} catch {
			/* ignore */
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<Box className="sylvenarr-header" h="100%" px={{ base: 16, sm: 28, md: 40, lg: 56, xl: 72 }}>
			<Group h="100%" justify="space-between" wrap="nowrap" gap="md" w="100%">
				<Group gap={{ base: 'md', md: 'xl' }} wrap="nowrap">
					<BrandMark size={26} />
					<Group gap={{ base: 'md', md: 'lg' }} visibleFrom="sm">
						{navItems.map((item) => (
							<Anchor
								key={item.to}
								component={Link}
								to={item.to}
								c="var(--app-text-muted)"
								size="sm"
								td="none"
								fw={500}
							>
								{item.label}
							</Anchor>
						))}
					</Group>
				</Group>

				<Group gap="sm" wrap="nowrap" align="center">
					<ThemeToggle />
					{player ? (
						<Menu shadow="md" width={240} position="bottom-end" radius={0}>
							<Menu.Target>
								<UnstyledButton aria-label="Меню аккаунта" className="sylvenarr-header-avatar">
									<Avatar
										src={player.avatarUrl}
										alt={player.displayName}
										radius="xl"
										size={36}
										color="brand"
									>
										{initialsFromName(player.displayName)}
									</Avatar>
								</UnstyledButton>
							</Menu.Target>
							<Menu.Dropdown className="sylvenarr-header-menu">
								<Menu.Label>
									<Group gap="sm" wrap="nowrap" align="flex-start">
										<Avatar src={player.avatarUrl} alt="" radius="xl" size={32} color="brand">
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
								</Menu.Label>
								<Menu.Divider />
								<Menu.Item component={Link} to="/lobby">
									Лобби
								</Menu.Item>
								<Menu.Item component={Link} to="/rating">
									Рейтинг
								</Menu.Item>
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
					) : (
						<Button
							component={Link}
							to="/sign-in"
							variant="light"
							color="brand"
							size="compact-sm"
							radius={0}
							className="sylvenarr-header-signin"
						>
							Войти
						</Button>
					)}
				</Group>
			</Group>
		</Box>
	);
};
