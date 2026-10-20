import { MantineProvider } from '@mantine/core';

import type { AppProvidersProps } from '../model/types';
import { cssVariablesResolver, theme } from './theme';

export const AppProviders = ({ children }: AppProvidersProps) => {
	return (
		<MantineProvider
			theme={theme}
			cssVariablesResolver={cssVariablesResolver}
			forceColorScheme="dark"
		>
			{children}
		</MantineProvider>
	);
};
