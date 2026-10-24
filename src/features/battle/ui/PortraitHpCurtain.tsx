import type { ReactNode } from 'react';

import styles from './PortraitHpCurtain.module.css';

type PortraitHpCurtainProps = {
	health: number;
	maxHp: number;
	children: ReactNode;
	className?: string;
};

/**
 * Красный полупрозрачный оверлей «штор» снизу вверх поверх портрета.
 * Высота = потерянное ОЗ / maxHp (при полном ОЗ штор нет).
 */
export const PortraitHpCurtain = ({
	health,
	maxHp,
	children,
	className,
}: PortraitHpCurtainProps) => {
	const missing =
		maxHp > 0 ? Math.max(0, Math.min(1, 1 - health / maxHp)) : 0;

	return (
		<span className={[styles.frame, className].filter(Boolean).join(' ')}>
			{children}
			<span
				className={styles.fill}
				style={{ height: `${missing * 100}%` }}
				aria-hidden
			/>
		</span>
	);
};
