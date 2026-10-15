import { Box, Stack, Text, Title } from '@mantine/core';

const rows = [
	{
		mark: 'I',
		title: 'Прогресс на вашем имени',
		body: 'Профиль хранит отображаемое имя между сессиями — арена узнаёт вас снова.',
	},
	{
		mark: 'II',
		title: 'Рейтинг на аккаунте',
		body: 'Победы и винрейт пишутся на профиль, а не на гостевую cookie-сессию.',
	},
	{
		mark: 'III',
		title: 'Возврат к тем же матчам',
		body: 'Один вход — тот же игрок в лобби и в таблице рейтинга.',
	},
] as const;

/**
 * Леджер ценности аккаунта — строки печати, не feature-cards.
 */
export const AccountSection = () => {
	return (
		<Box className="sylvenarr-landing-section" component="section">
			<Stack gap={{ base: 'lg', md: 'xl' }}>
				<Stack gap={10} maw={{ base: 560, lg: 720 }}>
					<Text className="sylvenarr-landing-kicker">Печать игрока</Text>
					<Title order={2} className="sylvenarr-landing-h2">
						Зачем аккаунт
					</Title>
					<Text className="sylvenarr-landing-lead" c="var(--app-text-muted)">
						Арена ведёт учёт по профилю — не по одноразовому гостю.
					</Text>
				</Stack>
				<Box className="sylvenarr-ledger">
					{rows.map((row) => (
						<Box key={row.mark} className="sylvenarr-ledger-row">
							<Text className="sylvenarr-ledger-mark" aria-hidden>
								{row.mark}
							</Text>
							<Title order={3} className="sylvenarr-landing-h3">
								{row.title}
							</Title>
							<Text className="sylvenarr-landing-body" c="var(--app-text-muted)">
								{row.body}
							</Text>
						</Box>
					))}
				</Box>
				<Text className="sylvenarr-landing-meta" c="var(--app-text-muted)" ff="monospace">
					Draft · бой — следующая фаза архива
				</Text>
			</Stack>
		</Box>
	);
};
