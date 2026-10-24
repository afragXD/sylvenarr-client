import type { HeroRoleTag } from '../model/types';

import styles from './HeroRoleTags.module.css';

type HeroRoleTagsProps = {
	tags: ReadonlyArray<HeroRoleTag>;
};

/**
 * Ролевые теги класса (ДД-МАГ, ПРИЗЫВАТЕЛЬ…) — caps-прямоугольники у описания.
 */
export const HeroRoleTags = ({ tags }: HeroRoleTagsProps) => {
	if (tags.length === 0) {
		return null;
	}
	return (
		<div className={styles.row} role="list" aria-label="Ролевые теги">
			{tags.map((tag) => (
				<span key={tag.id} className={styles.tag} data-mood={tag.mood} role="listitem">
					{tag.label}
				</span>
			))}
		</div>
	);
};
