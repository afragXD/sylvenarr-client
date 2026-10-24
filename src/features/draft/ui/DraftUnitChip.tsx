import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Box, Text } from '@mantine/core';

import { HeroImage } from '@/entities/hero';
import type { MatchDraftPick } from '@/entities/match';

import styles from './DraftUnitChip.module.css';

type DraftUnitChipProps = {
	pick: MatchDraftPick;
	canDrag: boolean;
};

/**
 * Юнит в панели команды; при canDrag — перенос между рядами.
 */
export const DraftUnitChip = ({ pick, canDrag }: DraftUnitChipProps) => {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: `pick:${pick.id}`,
		disabled: !canDrag,
		data: { type: 'pick', pickId: pick.id, fromRow: pick.row, size: pick.size },
	});

	const isHidden = !pick.heroClassCode || pick.displayName === 'Скрыто';

	return (
		<Box
			ref={setNodeRef}
			className={styles.unit}
			data-dragging={isDragging ? 'true' : undefined}
			style={{
				transform: CSS.Translate.toString(transform),
				cursor: canDrag ? undefined : 'default',
			}}
			{...(canDrag ? { ...listeners, ...attributes } : {})}
		>
			{isHidden ? (
				<Box w={32} h={32} style={{ background: 'var(--app-panel-border)', flexShrink: 0 }} />
			) : (
				<HeroImage code={pick.heroClassCode} alt={pick.displayName} w={32} h={32} radius={0} />
			)}
			<Text className={styles.name} size="sm" lineClamp={1}>
				{isHidden ? 'Скрыто' : pick.displayName}
				{pick.size > 1 ? ` (${pick.size})` : ''}
			</Text>
		</Box>
	);
};
