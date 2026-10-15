import { Stack, Text, Title } from '@mantine/core';

import { APP_DESCRIPTION, APP_TITLE } from '@/shared/constants';

export const HomePage = () => {
	return (
		<Stack gap="md" px={{ base: 24, sm: 48 }} py={{ base: 48, sm: 72 }} maw={640} mx="auto">
			<Title order={1}>{APP_TITLE}</Title>
			<Text c="var(--app-text-muted)" size="lg">
				{APP_DESCRIPTION}
			</Text>
		</Stack>
	);
};
