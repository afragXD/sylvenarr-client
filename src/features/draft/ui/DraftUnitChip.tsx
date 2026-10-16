import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Box, Text } from '@mantine/core';

import { HeroImage } from '@/entities/hero';
import type { MatchDraftPick } from '@/entities/match';

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

	return (
		<Box
			ref={setNodeRef}
			className="sylvenarr-draft-unit"
			data-dragging={isDragging ? 'true' : undefined}
			style={{
				transform: CSS.Translate.toString(transform),
				cursor: canDrag ? undefined : 'default',
			}}
			{...(canDrag ? { ...listeners, ...attributes } : {})}
		>
			<HeroImage code={pick.heroClassCode} alt={pick.displayName} w={32} h={32} radius={0} />
			<Text size="sm">
				{pick.displayName}
				{pick.size > 1 ? ` (${pick.size})` : ''}
			</Text>
		</Box>
	);
};
