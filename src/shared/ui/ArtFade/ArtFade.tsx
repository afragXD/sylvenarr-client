import type { CSSProperties, ReactNode } from 'react';

import classes from './ArtFade.module.css';

export type ArtFadeMask = 'left' | 'right' | 'bottom' | 'splash';

type ArtFadeProps = {
	src: string;
	alt?: string;
	mask?: ArtFadeMask;
	className?: string;
	style?: CSSProperties;
	children?: ReactNode;
};

/**
 * Арт / скриншот, растворённый в дыму по краям.
 */
export const ArtFade = ({
	src,
	alt = '',
	mask = 'splash',
	className,
	style,
	children,
}: ArtFadeProps) => {
	const rootClass = [classes.root, classes[mask], className].filter(Boolean).join(' ');

	return (
		<div className={rootClass} style={style}>
			<img className={classes.img} src={src} alt={alt} draggable={false} />
			<div className={classes.overlay} aria-hidden />
			{children}
		</div>
	);
};
