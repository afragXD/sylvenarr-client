import { Box, Text } from '@mantine/core';

import { HeroImage } from '@/entities/hero';

import styles from './DraftUnitChip.module.css';

export type DraftUnitChipViewProps = {
	displayName: string;
	heroClassCode: string | null;
	size?: number;
	/** Скрытый слот соперника. */
	hidden?: boolean;
	/** Класс-обёртка для DragOverlay (без touch-action grab). */
	overlay?: boolean;
};

/**
 * Внешний вид юнита в слоте (и копия в DragOverlay).
 */
export const DraftUnitChipView = ({
	displayName,
	heroClassCode,
	size = 1,
	hidden = false,
	overlay = false,
}: DraftUnitChipViewProps) => {
	const isHidden = hidden || !heroClassCode || displayName === 'Скрыто';

	return (
		<Box className={styles.unit} data-overlay={overlay ? 'true' : undefined}>
			{isHidden ? (
				<Box w={32} h={32} style={{ background: 'var(--app-panel-border)', flexShrink: 0 }} />
			) : (
				<HeroImage code={heroClassCode} alt={displayName} w={32} h={32} radius={0} />
			)}
			<Text className={styles.name} size="sm" lineClamp={1}>
				{isHidden ? 'Скрыто' : displayName}
				{size > 1 ? ` (${size})` : ''}
			</Text>
		</Box>
	);
};
