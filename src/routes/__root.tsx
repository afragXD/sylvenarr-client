import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { AppProviders, AppShellLayout } from '@/app';
import '@/app/styles';
import { APP_DESCRIPTION, SITE_URL } from '@/shared/constants';
import { seo, websiteJsonLd } from '@/shared/lib/seo';
import { AppFonts } from '@/shared/ui/AppFonts';

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: 'utf-8' },
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			...seo({
				title: 'Sylvenarr',
				description: APP_DESCRIPTION,
				url: SITE_URL,
			}),
		],
		links: [
			{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
			{ rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
			{ rel: 'manifest', href: '/site.webmanifest' },
		],
		scripts: [websiteJsonLd()],
	}),
	shellComponent: RootDocument,
});
function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ru" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript forceColorScheme="dark" />
				<AppFonts />
				<HeadContent />
			</head>
			<body>
				<AppProviders>
					<AppShellLayout>{children}</AppShellLayout>
					<TanStackDevtools
						config={{
							position: 'bottom-right',
						}}
						plugins={[
							{
								name: 'Tanstack Router',
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				</AppProviders>
				<Scripts />
			</body>
		</html>
	);
}
