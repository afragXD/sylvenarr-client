import { Link } from '@tanstack/react-router';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import classes from './OrnateButton.module.css';

type OrnateButtonVariant = 'outline' | 'parchment';
type OrnateButtonSize = 'sm' | 'md' | 'lg';

type StyleProps = {
	children: ReactNode;
	variant?: OrnateButtonVariant;
	size?: OrnateButtonSize;
	withDiamonds?: boolean;
	className?: string;
};

const buildClass = (
	variant: OrnateButtonVariant,
	size: OrnateButtonSize,
	className?: string,
): string =>
	[classes.root, classes[variant], size !== 'md' ? classes[size] : null, className]
		.filter(Boolean)
		.join(' ');

type OrnateButtonProps = StyleProps &
	Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>;

/**
 * Кнопка в стиле BG3: контурная или пергаментная.
 */
export const OrnateButton = ({
	children,
	variant = 'outline',
	size = 'md',
	withDiamonds = variant === 'outline',
	className,
	type = 'button',
	...rest
}: OrnateButtonProps) => {
	return (
		<button type={type} className={buildClass(variant, size, className)} {...rest}>
			{withDiamonds ? <span className={classes.diamond} aria-hidden /> : null}
			{children}
			{withDiamonds ? <span className={classes.diamond} aria-hidden /> : null}
		</button>
	);
};

type OrnateLinkProps = StyleProps & {
	to: string;
};

/**
 * Ссылка, оформленная как OrnateButton.
 */
export const OrnateLink = ({
	to,
	children,
	variant = 'outline',
	size = 'md',
	withDiamonds = variant === 'outline',
	className,
}: OrnateLinkProps) => {
	return (
		<Link to={to} className={buildClass(variant, size, className)}>
			{withDiamonds ? <span className={classes.diamond} aria-hidden /> : null}
			{children}
			{withDiamonds ? <span className={classes.diamond} aria-hidden /> : null}
		</Link>
	);
};
