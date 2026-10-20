import { GoldRule } from '../GoldRule';
import classes from './SectionHeading.module.css';

type SectionHeadingProps = {
	title: string;
	eyebrow?: string;
	align?: 'start' | 'center';
	order?: 2 | 3;
	withRule?: boolean;
	className?: string;
	id?: string;
};

/**
 * Заголовок секции: опциональная подпись, капители, золотая линия.
 */
export const SectionHeading = ({
	title,
	eyebrow,
	align = 'start',
	order = 2,
	withRule = true,
	className,
	id,
}: SectionHeadingProps) => {
	const Tag = order === 3 ? 'h3' : 'h2';
	const rootClass = [classes.root, classes[align], className].filter(Boolean).join(' ');
	const titleClass = [classes.title, order === 3 ? classes.h3 : classes.h2].join(' ');

	return (
		<div className={rootClass}>
			{eyebrow ? <span className={classes.eyebrow}>{eyebrow}</span> : null}
			<Tag className={titleClass} id={id}>
				{title}
			</Tag>
			{withRule ? <GoldRule align={align} /> : null}
		</div>
	);
};
