import { Box, Stack, type StackProps, Text } from '@mantine/core';
import type { ReactNode } from 'react';

import { ArtFade } from '../ArtFade';
import { SectionHeading } from '../SectionHeading';

export type PageFrameWidth = 'form' | 'content' | 'wide' | 'full';

const widthMap: Record<PageFrameWidth, number | undefined> = {
	form: 720,
	content: 1200,
	wide: undefined,
	full: undefined,
};

type PageFrameProps = {
	children: ReactNode;
	width?: PageFrameWidth;
	gap?: StackProps['gap'];
	className?: string;
	veil?: boolean;
	eyebrow?: string;
	title?: string;
	lead?: string;
	scene?: string;
};

/**
 * Каркас внутренних страниц: опциональная шапка со сценой + контент.
 */
export const PageFrame = ({
	children,
	width = 'wide',
	gap = 'md',
	className,
	veil = true,
	eyebrow,
	title,
	lead,
	scene,
}: PageFrameProps) => {
	const classes = [veil ? 'sylvenarr-page-veil' : null, className].filter(Boolean).join(' ');
	const hasHeader = Boolean(title);

	return (
		<Box className={classes || undefined}>
			{hasHeader ? (
				<Box
					px={{ base: 16, sm: 28, md: 40, lg: 56, xl: 72 }}
					pt={{ base: 24, sm: 32 }}
					pb={{ base: 8, sm: 12 }}
				>
					<Box
						style={{
							display: 'grid',
							gridTemplateColumns: scene ? 'minmax(0, 1.1fr) minmax(0, 0.9fr)' : '1fr',
							gap: '1.5rem',
							alignItems: 'center',
						}}
					>
						<Stack gap="sm" maw={640}>
							<SectionHeading title={title ?? ''} eyebrow={eyebrow} align="start" />
							{lead ? (
								<Text c="var(--app-text-muted)" style={{ lineHeight: 1.55, maxWidth: '42ch' }}>
									{lead}
								</Text>
							) : null}
						</Stack>
						{scene ? (
							<ArtFade src={scene} mask="left" alt="" style={{ minHeight: 180, maxHeight: 280 }} />
						) : null}
					</Box>
				</Box>
			) : null}
			<Box
				px={{ base: 16, sm: 28, md: 40, lg: 56, xl: 72 }}
				py={{ base: 24, sm: 32, md: 40, lg: 48 }}
			>
				<Stack
					gap={gap}
					maw={widthMap[width]}
					mx={widthMap[width] === undefined ? 0 : 'auto'}
					w="100%"
				>
					{children}
				</Stack>
			</Box>
		</Box>
	);
};
