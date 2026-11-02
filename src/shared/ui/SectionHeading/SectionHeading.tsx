import { GoldRule } from '../GoldRule';
import classes from './SectionHeading.module.css';

type SectionHeadingProps = {
	title: string;
	eyebrow?: string;
	align?: 'start' | 'center';
	/** 1 — H1 страницы (AC-10); 2/3 — секции. */
	order?: 1 | 2 | 3;
	withRule?: boolean;
	className?: string;
	id?: string;
};

/**
 * Заголовок: надзаголовок + H1/H2/H3 + ромб/линия (AC-10).
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
	const Tag = order === 1 ? 'h1' : order === 3 ? 'h3' : 'h2';
	const sizeClass = order === 1 ? classes.h1 : order === 3 ? classes.h3 : classes.h2;
	const rootClass = [classes.root, classes[align], className].filter(Boolean).join(' ');
	const titleClass = [classes.title, sizeClass].join(' ');

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
