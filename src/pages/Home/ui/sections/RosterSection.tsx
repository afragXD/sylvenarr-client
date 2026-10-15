import { Anchor, Box, Group, Stack, Text, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { HeroImage } from '@/entities/hero';

const ROSTER = [
	{ code: 'Archlich', displayName: 'Архилич' },
	{ code: 'Assassin', displayName: 'Ассасин' },
	{ code: 'Inquisitor', displayName: 'Инквизитор' },
	{ code: 'DemonLord', displayName: 'Демон-принц' },
	{ code: 'Detective', displayName: 'Детектив' },
	{ code: 'Abbess', displayName: 'Аббатиса' },
	{ code: 'Dracolich', displayName: 'Драколич' },
	{ code: 'GhostWarrior', displayName: 'Воин-призрак' },
	{ code: 'GoldGolem', displayName: 'Золотой голем' },
	{ code: 'Knight', displayName: 'Рыцарь-кентавр' },
	{ code: 'Herbalist', displayName: 'Травница' },
	{ code: 'Demiurge', displayName: 'Белый маг' },
] as const;

/**
 * Стена печатей классов — сетка, не Netflix-rail.
 */
export const RosterSection = () => {
	return (
		<Box className="sylvenarr-landing-section" component="section">
			<Stack gap={{ base: 'lg', md: 'xl' }}>
				<Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
					<Stack gap={10} maw={{ base: 560, lg: 720 }}>
						<Text className="sylvenarr-landing-kicker">Каталог печатей</Text>
						<Title order={2} className="sylvenarr-landing-h2">
							Реестр классов
						</Title>
						<Text className="sylvenarr-landing-lead" c="var(--app-text-muted)">
							Двадцать четыре класса уже высечены в каталоге. Откройте карточку перед набором.
						</Text>
					</Stack>
					<Anchor
						component={Link}
						to="/heroes"
						c="brand"
						fw={600}
						td="none"
						className="sylvenarr-landing-link"
					>
						Весь реестр
					</Anchor>
				</Group>
				<Box className="sylvenarr-roster-wall">
					{ROSTER.map(({ code, displayName }) => (
						<Box
							key={code}
							component={Link}
							to={`/heroes/${code}`}
							className="sylvenarr-roster-seal"
						>
							<Box className="sylvenarr-roster-seal__art">
								<HeroImage
									code={code}
									alt={displayName}
									variant="portrait"
									w="100%"
									h="100%"
									radius={0}
								/>
							</Box>
							<Text className="sylvenarr-roster-seal__code">{displayName}</Text>
						</Box>
					))}
				</Box>
			</Stack>
		</Box>
	);
};
