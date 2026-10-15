import { Box, Group, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { ThemeToggle } from '@/features/ThemeToggle';
import { APP_TITLE } from '@/shared/constants';

export const Header = () => {
	return (
		<Box
			px={24}
			h="100%"
			bg="var(--app-surface)"
			style={{
				borderBottom: '1px solid var(--app-border)',
			}}
		>
			<Group h="100%" justify="space-between" wrap="nowrap" gap="md">
				<Text component={Link} to="/" fw={700} size="lg" c="var(--app-text)" td="none">
					{APP_TITLE}
				</Text>
				<ThemeToggle />
			</Group>
		</Box>
	);
};
