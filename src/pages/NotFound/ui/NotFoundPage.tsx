import { Group, Stack, Text, Title } from '@mantine/core';

import { OrnateLink } from '@/shared/ui/OrnateButton';
import { PageFrame } from '@/shared/ui/PageFrame';

/**
 * Оформленная 404: любой неизвестный URL, /me, /account (AC-4).
 */
export const NotFoundPage = () => {
	return (
		<PageFrame width="content" veil={false}>
			<Stack gap="lg" maw={480} py="xl">
				<Stack gap={6}>
					<Text
						size="sm"
						c="var(--app-text-muted)"
						tt="uppercase"
						style={{ letterSpacing: '0.12em' }}
					>
						Ошибка 404
					</Text>
					<Title order={1}>Страница не найдена</Title>
					<Text c="var(--app-text-muted)">
						Такого адреса нет. Вернитесь на главную или откройте реестр героев.
					</Text>
				</Stack>
				<Group gap="sm">
					<OrnateLink to="/" variant="parchment" withDiamonds={false}>
						На главную
					</OrnateLink>
					<OrnateLink to="/heroes">К героям</OrnateLink>
				</Group>
			</Stack>
		</PageFrame>
	);
};
