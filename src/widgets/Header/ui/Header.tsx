import { Anchor, Box, Group } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { ThemeToggle } from '@/features/ThemeToggle';
import { BrandMark } from '@/shared/ui/BrandMark';

const navItems = [
	{ to: '/heroes', label: 'Герои' },
	{ to: '/lobby', label: 'Лобби' },
	{ to: '/rating', label: 'Рейтинг' },
] as const;

export const Header = () => {
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
				<ThemeToggle />
			</Group>
		</Box>
	);
};
