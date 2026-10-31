import { useDraggable } from '@dnd-kit/core';
import { Box } from '@mantine/core';

import type { MatchDraftPick } from '@/entities/match';

import { DraftUnitChipView } from './DraftUnitChipView';
import styles from './DraftUnitChip.module.css';

type DraftUnitChipProps = {
	pick: MatchDraftPick;
	canDrag: boolean;
};

/**
 * Юнит в панели команды; при canDrag — перенос между рядами.
 * Трансформ не двигает оригинал: копия идёт через DragOverlay (AC-3.14/3.15).
 */
export const DraftUnitChip = ({ pick, canDrag }: DraftUnitChipProps) => {
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: `pick:${pick.id}`,
		disabled: !canDrag,
		data: {
			type: 'pick',
			pickId: pick.id,
			fromRow: pick.row,
			size: pick.size,
			displayName: pick.displayName,
			heroClassCode: pick.heroClassCode,
		},
	});

	const isHidden = !pick.heroClassCode || pick.displayName === 'Скрыто';

	return (
		<Box
			ref={setNodeRef}
			className={styles.dragSource}
			data-dragging={isDragging ? 'true' : undefined}
			style={{ cursor: canDrag ? undefined : 'default' }}
			{...(canDrag ? { ...listeners, ...attributes } : {})}
		>
			<DraftUnitChipView
				displayName={pick.displayName}
				heroClassCode={pick.heroClassCode}
				size={pick.size}
				hidden={isHidden}
			/>
		</Box>
	);
};
