import { Box } from '@mantine/core';

import { HomeHero } from './HomeHero';
import { CloseSection, GameplaySection, PathSection, RosterSection } from './sections';

export const HomePage = () => {
	return (
		<Box className="sylvenarr-page-veil">
			<HomeHero />
			<PathSection />
			<RosterSection />
			<GameplaySection />
			<CloseSection />
		</Box>
	);
};
