import { AppShell } from '@mantine/core';

import { CookieNotice } from '@/shared/ui/CookieNotice';
import { Header } from '@/widgets/Header';

import type { AppShellLayoutProps } from '../model/types';

export const AppShellLayout = ({ children }: AppShellLayoutProps) => {
	return (
		<AppShell header={{ height: 64 }} padding={0}>
			<AppShell.Header withBorder={false}>
				<Header />
			</AppShell.Header>
			<AppShell.Main>{children}</AppShell.Main>
			<CookieNotice />
		</AppShell>
	);
};
