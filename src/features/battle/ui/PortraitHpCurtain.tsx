import type { ReactNode } from 'react';

import styles from './PortraitHpCurtain.module.css';

type PortraitHpCurtainProps = {
	health: number;
	maxHp: number;
	children: ReactNode;
	className?: string;
};

/**
 * Красный полупрозрачный оверлей ОЗ снизу вверх поверх портрета.
 * Высота = (health / maxHp) * высота портрета.
 */
export const PortraitHpCurtain = ({
	health,
	maxHp,
	children,
	className,
}: PortraitHpCurtainProps) => {
	const ratio =
		maxHp > 0 ? Math.max(0, Math.min(1, health / maxHp)) : 0;

	return (
		<span className={[styles.frame, className].filter(Boolean).join(' ')}>
			{children}
			<span
				className={styles.fill}
				style={{ height: `${ratio * 100}%` }}
				aria-hidden
			/>
		</span>
	);
};
