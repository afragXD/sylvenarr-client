import { AppShell } from '@mantine/core';

import { CookieNotice } from '@/shared/ui/CookieNotice';
import { Footer } from '@/widgets/Footer';
import { Header } from '@/widgets/Header';

import type { AppShellLayoutProps } from '../model/types';

export const AppShellLayout = ({ children }: AppShellLayoutProps) => {
	return (
		<AppShell header={{ height: 72, offset: 0 }} padding={0} withBorder={false}>
			<AppShell.Header
				withBorder={false}
				style={{ background: 'transparent', overflow: 'visible' }}
			>
				<Header />
			</AppShell.Header>
			<AppShell.Main>
				{children}
				<Footer />
			</AppShell.Main>
			<CookieNotice />
		</AppShell>
	);
};
