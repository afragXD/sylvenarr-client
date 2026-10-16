import { Box, Stack, Table, Text, Title } from '@mantine/core';

import { APP_TITLE } from '@/shared/constants';
import { PageFrame } from '@/shared/ui/PageFrame';

const cookieRows = [
	{
		name: 'playerId',
		purpose: 'Сессия входа: по нему сервер понимает, что вы вошли в аккаунт.',
		lifetime: 'До выхода из аккаунта',
	},
	{
		name: 'oauthState',
		purpose: 'Защита входа через Яндекс от подмены запроса (CSRF).',
		lifetime: 'Несколько минут, только на время входа',
	},
] as const;

/**
 * Политика конфиденциальности и cookie.
 */
export const PrivacyPage = () => {
	return (
		<PageFrame width="content" gap="xl">
			<Stack gap={6} maw={720}>
				<Title order={1}>Конфиденциальность</Title>
				<Text c="var(--app-text-muted)">
					Что {APP_TITLE} хранит о вас и какие cookie использует. Коротко и без юридического
					жаргона.
				</Text>
			</Stack>

			<Stack gap="sm" maw={720}>
				<Title order={2}>Какие данные храним</Title>
				<Text>
					После входа через Яндекс мы сохраняем идентификатор аккаунта и отображаемое имя. Пароль и
					почту мы не получаем. Кроме этого хранятся результаты ваших матчей — они нужны для
					рейтинга.
				</Text>
			</Stack>

			<Stack gap="sm">
				<Title order={2}>Cookie</Title>
				<Text maw={720}>
					Сайт ставит только технические cookie, необходимые для входа. Аналитических и рекламных
					cookie нет.
				</Text>
				<Box style={{ overflowX: 'auto' }}>
					<Table
						className="sylvenarr-registry-table"
						horizontalSpacing="md"
						verticalSpacing="sm"
						style={{ borderCollapse: 'collapse', minWidth: 520, maxWidth: 900 }}
					>
						<Table.Thead>
							<Table.Tr>
								<Table.Th w={160}>Cookie</Table.Th>
								<Table.Th>Зачем нужна</Table.Th>
								<Table.Th w={220}>Срок</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{cookieRows.map((row) => (
								<Table.Tr key={row.name} style={{ borderBottom: '1px solid var(--app-border)' }}>
									<Table.Td ff="monospace" fw={600}>
										{row.name}
									</Table.Td>
									<Table.Td>{row.purpose}</Table.Td>
									<Table.Td c="var(--app-text-muted)">{row.lifetime}</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</Box>
			</Stack>

			<Stack gap="sm" maw={720}>
				<Title order={2}>Как удалить данные</Title>
				<Text>
					Кнопка «Выйти» стирает cookie сессии на этом устройстве. Чтобы удалить аккаунт и историю
					матчей целиком, напишите нам — удалим по запросу.
				</Text>
			</Stack>
		</PageFrame>
	);
};
