import { Anchor, Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { APP_TITLE } from '@/shared/constants';
import { RuneGateIcon } from '@/shared/ui/BrandMark';

const footerLinks = [
	{ to: '/heroes', label: 'Реестр' },
	{ to: '/lobby', label: 'Лобби' },
	{ to: '/rating', label: 'Рейтинг' },
	{ to: '/sign-in', label: 'Войти' },
	{ to: '/privacy', label: 'Конфиденциальность' },
] as const;

/**
 * Порог врат + подвал лендинга.
 */
export const CloseSection = () => {
	return (
		<Box className="sylvenarr-landing-close" component="footer">
			<Box className="sylvenarr-landing-close__gate">
				<Stack className="sylvenarr-landing-close__inner" gap="md" align="center">
					<span className="sylvenarr-landing-close__emblem" aria-hidden>
						<RuneGateIcon size={48} />
					</span>
					<Text className="sylvenarr-landing-kicker">Порог врат</Text>
					<Title order={2} className="sylvenarr-landing-close__title">
						Войдите под своим именем
					</Title>
					<Text className="sylvenarr-landing-close__lead" c="var(--app-text-muted)">
						Войдите через OAuth — затем откройте реестр и готовьтесь к арене.
					</Text>
					<Group className="sylvenarr-hero-cta" gap="md" justify="center" mt="xs">
						<Button component={Link} to="/sign-in" color="brand" size="lg">
							Войти
						</Button>
						<Text component={Link} to="/heroes" className="sylvenarr-landing-close__signin">
							Сначала реестр героев
						</Text>
					</Group>
				</Stack>
			</Box>

			<Box className="sylvenarr-landing-close__bar">
				<Group justify="space-between" align="center" wrap="wrap" gap="md">
					<Text className="sylvenarr-landing-close__brand">
						{APP_TITLE}
						<Text span className="sylvenarr-landing-close__edition">
							{' '}
							· Origins
						</Text>
					</Text>
					<Group gap={{ base: 'md', sm: 'xl' }} wrap="wrap">
						{footerLinks.map((item) => (
							<Anchor
								key={item.to}
								component={Link}
								to={item.to}
								className="sylvenarr-landing-close__link"
								td="none"
							>
								{item.label}
							</Anchor>
						))}
					</Group>
				</Group>
			</Box>
		</Box>
	);
};
