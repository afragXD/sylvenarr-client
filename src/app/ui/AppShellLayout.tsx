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
				/* Выше SiteMenu Drawer (400): бургер «Закрыть» остаётся на месте (AC-9). */
				style={{ background: 'transparent', overflow: 'visible', zIndex: 450 }}
			>
				<Header />
			</AppShell.Header>
			<AppShell.Main style={{ paddingBottom: 'var(--cookie-notice-offset, 0px)' }}>
				{children}
				<Footer />
			</AppShell.Main>
			<CookieNotice />
		</AppShell>
	);
};
