import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { getHeroCharacterUrl } from '@/entities/hero';
import { BrandMark } from '@/shared/ui/BrandMark';

const HERO_ART = getHeroCharacterUrl('Archlich');

/**
 * Full-bleed hero: характер + бренд + plate CTA.
 */
export const HomeHero = () => {
	return (
		<Box className="sylvenarr-hero-shell" pos="relative" mih="calc(100dvh - 64px)">
			<Box
				className="sylvenarr-hero-plane"
				pos="absolute"
				inset={0}
				aria-hidden
				style={{ ['--sylvenarr-hero-art' as string]: `url(${HERO_ART})` }}
			/>
			<Box
				pos="relative"
				mih="calc(100dvh - 64px)"
				w="100%"
				px={{ base: 20, sm: 40, md: 64, lg: 80, xl: 96 }}
				py={{ base: 48, sm: 64, md: 80 }}
				style={{ display: 'flex', alignItems: 'center', zIndex: 3 }}
			>
				<Stack
					className="sylvenarr-hero-copy"
					gap="lg"
					maw={{ base: '100%', sm: 480, md: 560, lg: 620 }}
				>
					<BrandMark variant="hero" size={56} />
					<Text className="sylvenarr-hero-supporting" c="var(--app-text-muted)">
						Соревновательная онлайн-арена в жанре тёмного технофэнтези — с отголосками Disciples&nbsp;II,
						Heroes of Might and Magic&nbsp;III и Darkest Dungeon. Наберите отряд из двадцати четырёх
						классов с уникальными способностями и победите соперника в пошаговой дуэли.
					</Text>
					<Group className="sylvenarr-hero-cta" gap="sm" mt="md">
						<Button component={Link} to="/sign-in" color="brand" size="lg">
							Войти
						</Button>
						<Button component={Link} to="/heroes" variant="default" size="lg">
							Реестр героев
						</Button>
					</Group>
				</Stack>
			</Box>
		</Box>
	);
};
