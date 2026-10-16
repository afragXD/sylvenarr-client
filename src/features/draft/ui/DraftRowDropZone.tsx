import { useDroppable } from '@dnd-kit/core';
import { Stack, Text } from '@mantine/core';

import type { MatchDraftPick } from '@/entities/match';
import styles from './DraftRowDropZone.module.css';
import { DraftUnitChip } from './DraftUnitChip';

type DraftRowDropZoneProps = {
	row: 0 | 1;
	label: string;
	picks: MatchDraftPick[];
	acceptDrops: boolean;
	ownerPlayerId: string;
	canDragUnits: boolean;
};

/**
 * Столбец ряда команды как зона drop для пика / переноса.
 */
export const DraftRowDropZone = ({
	row,
	label,
	picks,
	acceptDrops,
	ownerPlayerId,
	canDragUnits,
}: DraftRowDropZoneProps) => {
	const { setNodeRef, isOver } = useDroppable({
		id: `row:${ownerPlayerId}:${row}`,
		disabled: !acceptDrops,
		data: { type: 'row', row, ownerPlayerId },
	});

	return (
		<Stack gap={4} h="100%">
			<Text size="xs" c="var(--app-text-muted)" tt="uppercase">
				{label}
			</Text>
			<div
				ref={setNodeRef}
				className={styles.row}
				data-over={acceptDrops && isOver ? 'true' : undefined}
			>
				{picks.length === 0 ? (
					<Text size="sm" c="var(--app-text-muted)">
						—
					</Text>
				) : (
					<Stack gap="xs">
						{picks.map((pick) => (
							<DraftUnitChip key={pick.id} pick={pick} canDrag={canDragUnits} />
						))}
					</Stack>
				)}
			</div>
		</Stack>
	);
};
