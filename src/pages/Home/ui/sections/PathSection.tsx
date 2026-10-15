import { Box, Stack, Text, Title } from '@mantine/core';

const steps = [
	{
		n: '01',
		title: 'Создать аккаунт',
		body: 'Имя и прогресс закрепляются за вами — не за разовой сессией.',
	},
	{
		n: '02',
		title: 'Изучить реестр',
		body: 'Двадцать четыре класса: статы, роли и кого брать в отряд.',
	},
	{
		n: '03',
		title: 'Выйти на арену',
		body: 'Когда откроется фаза боя — дуэль уже с вашим профилем.',
	},
] as const;

/**
 * Обряд входа на арену — вертикальная дорожка, не три равные колонки.
 */
export const PathSection = () => {
	return (
		<Box className="sylvenarr-landing-section" component="section">
			<Stack gap={{ base: 'xl', md: 40 }}>
				<Stack gap={10}>
					<Text className="sylvenarr-landing-kicker">Обряд входа</Text>
					<Title order={2} className="sylvenarr-landing-h2">
						Три шага до арены
					</Title>
				</Stack>
				<Box className="sylvenarr-path-rail">
					{steps.map((step) => (
						<Box key={step.n} className="sylvenarr-path-step">
							<Text className="sylvenarr-landing-step-n" aria-hidden>
								{step.n}
							</Text>
							<Title order={3} className="sylvenarr-landing-h3">
								{step.title}
							</Title>
							<Text className="sylvenarr-landing-body" c="var(--app-text-muted)">
								{step.body}
							</Text>
						</Box>
					))}
				</Box>
			</Stack>
		</Box>
	);
};
