import { Box, Stack, Text, Title } from '@mantine/core';

const rows = [
	{
		mark: 'I',
		title: 'Два ряда',
		body: 'Передний принимает удар, задний бьёт из глубины; юнита можно переставить.',
	},
	{
		mark: 'II',
		title: 'Ход по инициативе',
		body: 'Атака, защита, способность или ожидание — кто быстрее, тот ходит раньше.',
	},
	{
		mark: 'III',
		title: 'Эффекты и рост',
		body: 'Баффы и дебаффы на поле; отряд усиливается по ходу боя.',
	},
] as const;

/**
 * Леджер геймплея — строки печати, не feature-cards.
 */
export const GameplaySection = () => {
	return (
		<Box className="sylvenarr-landing-section" component="section">
			<Stack gap={{ base: 'lg', md: 'xl' }}>
				<Stack gap={10} maw={{ base: 560, lg: 720 }}>
					<Text className="sylvenarr-landing-kicker">Геймплей</Text>
					<Title order={2} className="sylvenarr-landing-h2">
						Как идёт дуэль
					</Title>
					<Text className="sylvenarr-landing-lead" c="var(--app-text-muted)">
						Пошаговый бой один на один: отряд, ряды, ходы по инициативе.
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
					Сначала реестр классов · потом лобби с другом
				</Text>
			</Stack>
		</Box>
	);
};
