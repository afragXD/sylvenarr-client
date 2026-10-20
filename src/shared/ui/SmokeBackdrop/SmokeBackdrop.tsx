import classes from './SmokeBackdrop.module.css';

const NOISE =
	"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

type SmokeBackdropProps = {
	variant?: 'default' | 'wine';
	className?: string;
};

/**
 * Процедурный дым на чёрной / винной основе.
 */
export const SmokeBackdrop = ({ variant = 'default', className }: SmokeBackdropProps) => {
	const rootClass = [classes.root, classes[variant], className].filter(Boolean).join(' ');

	return (
		<div className={rootClass} aria-hidden>
			<div className={classes.gradient} />
			<div className={classes.layer} style={{ backgroundImage: NOISE }} />
		</div>
	);
};
