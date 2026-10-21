import { Stack, type StackProps, Text } from '@mantine/core';
import type { ReactNode } from 'react';

import { ArtFade } from '../ArtFade';
import { SectionHeading } from '../SectionHeading';

import classes from './PageFrame.module.css';

export type PageFrameWidth = 'form' | 'content' | 'wide' | 'full';

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
 * Горизонталь совпадает с хедером и подвалом (`--page-inline` / `--page-max`).
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
	const rootClass = [veil ? 'sylvenarr-page-veil' : null, classes.root, className]
		.filter(Boolean)
		.join(' ');
	const hasHeader = Boolean(title);
	const stackWidth =
		width === 'form'
			? classes.stackForm
			: width === 'content'
				? classes.stackContent
				: width === 'full'
					? classes.stackFull
					: classes.stackWide;

	return (
		<div className={rootClass || undefined}>
			{hasHeader ? (
				<div className={classes.header}>
					<div
						className={[classes.headerGrid, scene ? classes.headerGridWithScene : null]
							.filter(Boolean)
							.join(' ')}
					>
						<Stack gap="sm">
							<SectionHeading title={title ?? ''} eyebrow={eyebrow} align="start" />
							{lead ? (
								<Text c="var(--app-text-muted)" className={classes.lead}>
									{lead}
								</Text>
							) : null}
						</Stack>
						{scene ? (
							<ArtFade src={scene} mask="left" alt="" style={{ minHeight: 180, maxHeight: 280 }} />
						) : null}
					</div>
				</div>
			) : null}
			<div className={classes.body}>
				<Stack gap={gap} className={[classes.stack, stackWidth].join(' ')}>
					{children}
				</Stack>
			</div>
		</div>
	);
};
