import { Box } from '@mantine/core';

import { HomeHero } from './HomeHero';
import { AccountSection, CloseSection, PathSection, RosterSection } from './sections';

export const HomePage = () => {
	return (
		<Box className="sylvenarr-page-veil">
			<HomeHero />
			<PathSection />
			<RosterSection />
			<AccountSection />
			<CloseSection />
		</Box>
	);
};
