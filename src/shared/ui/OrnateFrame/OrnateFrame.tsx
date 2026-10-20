import type { ReactNode } from 'react';

import classes from './OrnateFrame.module.css';

export type OrnateFrameVariant = 'panel' | 'card' | 'tabbed' | 'medallion';

type OrnateFrameProps = {
	children: ReactNode;
	variant?: OrnateFrameVariant;
	tabLabel?: string;
	medallion?: ReactNode;
	className?: string;
	as?: 'div' | 'section' | 'article';
};

const Corner = ({ className }: { className: string }) => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: decorative corner
	<svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true">
		<path d="M1 13V4.5L4.5 1H13" stroke="currentColor" strokeWidth="1.2" />
		<path d="M1 7H5M7 1V5" stroke="currentColor" strokeWidth="1" opacity="0.7" />
		<circle cx="1.5" cy="1.5" r="1.2" fill="currentColor" />
	</svg>
);

/**
 * Тёмная панель с латунной филигранью.
 */
export const OrnateFrame = ({
	children,
	variant = 'panel',
	tabLabel,
	medallion,
	className,
	as: Tag = 'div',
}: OrnateFrameProps) => {
	const rootClass = [classes.root, classes[variant], className].filter(Boolean).join(' ');

	return (
		<Tag className={rootClass}>
			<Corner className={`${classes.corner} ${classes.tl}`} />
			<Corner className={`${classes.corner} ${classes.tr}`} />
			<Corner className={`${classes.corner} ${classes.bl}`} />
			<Corner className={`${classes.corner} ${classes.br}`} />
			{variant === 'tabbed' && tabLabel ? <span className={classes.tab}>{tabLabel}</span> : null}
			{variant === 'medallion' && medallion ? (
				<span className={classes.medallionMark}>{medallion}</span>
			) : null}
			{children}
			{/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative ornament */}
			<svg className={classes.ornament} viewBox="0 0 48 8" fill="none" aria-hidden="true">
				<path d="M0 4H18L24 1L30 4H48" stroke="currentColor" strokeWidth="1" />
				<path d="M22 4L24 7L26 4L24 1L22 4Z" fill="currentColor" />
			</svg>
		</Tag>
	);
};
