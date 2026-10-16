import { Anchor, Box, Button, Group, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { fetchCurrentPlayer, logoutPlayer, type Player } from '@/entities/player';
import { ThemeToggle } from '@/features/ThemeToggle';
import { BrandMark } from '@/shared/ui/BrandMark';

const navItems = [
	{ to: '/heroes', label: 'Герои' },
	{ to: '/lobby', label: 'Лобби' },
	{ to: '/rating', label: 'Рейтинг' },
] as const;

export const Header = () => {
	const [player, setPlayer] = useState<Player | null>(null);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const refreshSession = () => {
		void fetchCurrentPlayer()
			.then(setPlayer)
			.catch(() => {
				setPlayer(null);
			});
	};

	useEffect(() => {
		refreshSession();
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
				<Group gap="sm" wrap="nowrap">
					{player ? (
						<>
							<Text size="sm" c="var(--app-text-muted)" visibleFrom="sm" lineClamp={1} maw={160}>
								{player.displayName}
							</Text>
							<Button
								variant="subtle"
								color="gray"
								size="compact-sm"
								loading={isLoggingOut}
								onClick={() => void handleLogout()}
							>
								Выйти
							</Button>
						</>
					) : (
						<Button
							component={Link}
							to="/sign-in"
							variant="light"
							color="brand"
							size="compact-sm"
						>
							Войти
						</Button>
					)}
					<ThemeToggle />
				</Group>
			</Group>
		</Box>
	);
};
