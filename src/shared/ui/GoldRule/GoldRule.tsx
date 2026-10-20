import classes from './GoldRule.module.css';

type GoldRuleProps = {
	align?: 'start' | 'center';
	className?: string;
};

/**
 * Латунная линия с ромбом.
 */
export const GoldRule = ({ align = 'start', className }: GoldRuleProps) => {
	const rootClass = [classes.root, classes[align], className].filter(Boolean).join(' ');

	return (
		<div className={rootClass} aria-hidden>
			{align === 'center' ? <div className={classes.line} /> : null}
			<span className={classes.diamond} />
			<div className={classes.line} />
		</div>
	);
};
