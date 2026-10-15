import { Box, Stack, type StackProps } from '@mantine/core';
import type { ReactNode } from 'react';

export type PageFrameWidth = 'form' | 'content' | 'wide' | 'full';

const widthMap: Record<PageFrameWidth, number | undefined> = {
	/** Узкие формы */
	form: 720,
	/** Карточка героя */
	content: 1200,
	/** Реестр / рейтинг / лобби — почти на всю ширину */
	wide: undefined,
	/** Без потолка */
	full: undefined,
};

type PageFrameProps = {
	children: ReactNode;
	/** Ширина контентной колонки */
	width?: PageFrameWidth;
	/** Вертикальный gap внутри Stack */
	gap?: StackProps['gap'];
	className?: string;
	/** Атмосферный vignette */
	veil?: boolean;
};

/**
 * Единый каркас внутренних страниц: адаптивные отступы + max-width под desktop.
 */
export const PageFrame = ({
	children,
	width = 'wide',
	gap = 'md',
	className,
	veil = true,
}: PageFrameProps) => {
	const classes = [veil ? 'sylvenarr-page-veil' : null, className].filter(Boolean).join(' ');

	return (
		<Box
			className={classes || undefined}
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
	);
};
