import { AppShell } from '@mantine/core';

import { Header } from '@/widgets/Header';

import type { AppShellLayoutProps } from '../model/types';

export const AppShellLayout = ({ children }: AppShellLayoutProps) => {
	return (
		<AppShell header={{ height: 56 }} padding={0}>
			<AppShell.Header withBorder={false}>
				<Header />
			</AppShell.Header>
			<AppShell.Main>{children}</AppShell.Main>
		</AppShell>
	);
};
