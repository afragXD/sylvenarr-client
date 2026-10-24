import {
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useDraggable,
	useDroppable,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Box, Button, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { useMemo, useState } from 'react';

import { type HeroClass, HeroImage } from '@/entities/hero';
import type { SquadPreset, SquadPresetSlotInput } from '@/entities/presets';

const ROW_FRONT = 0;
const ROW_BACK = 1;
const MAX_PER_ROW = 3;

type DraftSlot = SquadPresetSlotInput & {
	key: string;
	displayName: string;
	size: number;
};

type PresetEditorFormProps = {
	heroes: HeroClass[];
	initial?: SquadPreset | null;
	/** Показать тумблер «Глобальный» (только admin). */
	allowGlobal?: boolean;
	busy?: boolean;
	onSubmit: (input: {
		name: string;
		slots: SquadPresetSlotInput[];
		global?: boolean;
	}) => Promise<void>;
	onCancel: () => void;
};

/**
 * Форма создания/правки пресета: имя, ряды, выбор героев.
 * Героев между рядами переносят drag-and-drop.
 */
export const PresetEditorForm = ({
	heroes,
	initial,
	allowGlobal = false,
	busy = false,
	onSubmit,
	onCancel,
}: PresetEditorFormProps) => {
	const [name, setName] = useState(initial?.name ?? '');
	const [isGlobal, setIsGlobal] = useState(initial?.isGlobal ?? false);
	const [slots, setSlots] = useState<DraftSlot[]>(() =>
		(initial?.slots ?? []).map((slot, index) => ({
			key: `${slot.id}-${index}`,
			heroClassCode: slot.heroClassCode,
			row: slot.row,
			displayName: slot.displayName,
			size: slot.size,
		})),
	);
	const [error, setError] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
	);

	const playable = useMemo(
		() =>
			[...heroes]
				.filter((hero) => hero.isPlayable)
				.sort((a, b) => b.size - a.size || a.displayName.localeCompare(b.displayName, 'ru')),
		[heroes],
	);

	const teamSize = slots.reduce((sum, slot) => sum + slot.size, 0);

	const addHero = (code: string | null) => {
		if (!code) {
			return;
		}
		const hero = playable.find((item) => item.code === code);
		if (!hero) {
			return;
		}
		const frontCount = slots.filter((slot) => slot.row === ROW_FRONT).length;
		const backCount = slots.filter((slot) => slot.row === ROW_BACK).length;
		const targetRow =
			frontCount < MAX_PER_ROW ? ROW_FRONT : backCount < MAX_PER_ROW ? ROW_BACK : null;
		if (targetRow === null) {
			setError('Нет места в рядах');
			return;
		}
		if (teamSize + hero.size > 6) {
			setError('Размер пресета не больше 6');
			return;
		}
		setError(null);
		setSlots((prev) => [
			...prev,
			{
				key: `${code}-${Date.now()}`,
				heroClassCode: hero.code,
				row: targetRow,
				displayName: hero.displayName,
				size: hero.size,
			},
		]);
	};

	const removeSlot = (key: string) => {
		setSlots((prev) => prev.filter((slot) => slot.key !== key));
		setError(null);
	};

	const moveSlotToRow = (slotKey: string, targetRow: number) => {
		const slot = slots.find((item) => item.key === slotKey);
		if (!slot || slot.row === targetRow) {
			return;
		}
		const targetCount = slots.filter((item) => item.row === targetRow).length;
		if (targetCount >= MAX_PER_ROW) {
			setError('На этом ряду нет места');
			return;
		}
		setError(null);
		setSlots((prev) =>
			prev.map((item) => (item.key === slotKey ? { ...item, row: targetRow } : item)),
		);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		if (busy) {
			return;
		}
		const over = event.over;
		if (!over) {
			return;
		}
		const overData = over.data.current as { type?: string; row?: number } | undefined;
		if (overData?.type !== 'row' || (overData.row !== ROW_FRONT && overData.row !== ROW_BACK)) {
			return;
		}
		const activeData = event.active.data.current as
			| { type?: string; slotKey?: string; fromRow?: number }
			| undefined;
		if (activeData?.type !== 'slot' || !activeData.slotKey) {
			return;
		}
		moveSlotToRow(activeData.slotKey, overData.row);
	};

	const handleSave = async () => {
		const trimmed = name.trim();
		if (!trimmed) {
			setError('Укажите имя');
			return;
		}
		if (teamSize < 3 || teamSize > 6) {
			setError(`Размер пресета от 3 до 6 (сейчас ${teamSize})`);
			return;
		}
		setError(null);
		try {
			await onSubmit({
				name: trimmed,
				slots: slots.map(({ heroClassCode, row: slotRow }) => ({
					heroClassCode,
					row: slotRow,
				})),
				...(allowGlobal ? { global: isGlobal } : {}),
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Не удалось сохранить');
		}
	};

	const front = slots.filter((slot) => slot.row === ROW_FRONT);
	const back = slots.filter((slot) => slot.row === ROW_BACK);

	return (
		<Stack gap="md">
			<TextInput
				label="Название"
				value={name}
				onChange={(event) => setName(event.currentTarget.value)}
				maxLength={40}
				disabled={busy}
			/>
			{allowGlobal ? (
				<Select
					label="Область"
					data={[
						{ value: 'personal', label: 'Личный' },
						{ value: 'global', label: 'Глобальный (для всех)' },
					]}
					value={isGlobal ? 'global' : 'personal'}
					onChange={(value) => setIsGlobal(value === 'global')}
					disabled={busy || Boolean(initial)}
				/>
			) : null}
			<Text size="sm" c="var(--app-text-muted)">
				Размер: {teamSize}/6 (минимум 3). Перетащите героя между рядами.
			</Text>
			<Select
				label="Добавить героя"
				placeholder="Выберите класс"
				searchable
				data={playable.map((hero) => ({
					value: hero.code,
					label: `${hero.displayName} (${hero.size})`,
				}))}
				value={null}
				onChange={addHero}
				disabled={busy}
			/>
			<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
				<Group align="stretch" gap="xl" wrap="wrap">
					<SlotColumn
						row={ROW_FRONT}
						title="Передний ряд"
						items={front}
						onRemove={removeSlot}
						busy={busy}
					/>
					<SlotColumn
						row={ROW_BACK}
						title="Задний ряд"
						items={back}
						onRemove={removeSlot}
						busy={busy}
					/>
				</Group>
			</DndContext>
			{error ? (
				<Text c="red" role="alert">
					{error}
				</Text>
			) : null}
			<Group gap="sm">
				<Button color="brand" loading={busy} onClick={() => void handleSave()}>
					Сохранить
				</Button>
				<Button variant="default" disabled={busy} onClick={onCancel}>
					Отмена
				</Button>
			</Group>
		</Stack>
	);
};

const SlotColumn = ({
	row,
	title,
	items,
	onRemove,
	busy,
}: {
	row: number;
	title: string;
	items: DraftSlot[];
	onRemove: (key: string) => void;
	busy: boolean;
}) => {
	const { setNodeRef, isOver } = useDroppable({
		id: `preset-row:${row}`,
		disabled: busy,
		data: { type: 'row', row },
	});

	return (
		<Stack gap="xs" miw={220} style={{ flex: 1 }}>
			<Text fw={600} size="sm">
				{title}
			</Text>
			<Box
				ref={setNodeRef}
				p="sm"
				mih={140}
				style={{
					border: `1px dashed ${
						isOver
							? 'var(--mantine-color-accent-filled)'
							: 'color-mix(in srgb, var(--app-text) 22%, transparent)'
					}`,
					background: isOver
						? 'color-mix(in srgb, var(--mantine-color-accent-filled) 12%, var(--app-surface))'
						: 'color-mix(in srgb, var(--app-surface-muted) 70%, transparent)',
					outline: isOver
						? '1px solid color-mix(in srgb, var(--mantine-color-accent-filled) 45%, transparent)'
						: undefined,
					transition: 'border-color 120ms ease, background 120ms ease, outline 120ms ease',
				}}
			>
				{items.length === 0 ? (
					<Text size="sm" c="var(--app-text-muted)">
						Пусто
					</Text>
				) : (
					<Stack gap="xs">
						{items.map((slot) => (
							<DraggableSlot
								key={slot.key}
								slot={slot}
								onRemove={onRemove}
								busy={busy}
							/>
						))}
					</Stack>
				)}
			</Box>
		</Stack>
	);
};

const DraggableSlot = ({
	slot,
	onRemove,
	busy,
}: {
	slot: DraftSlot;
	onRemove: (key: string) => void;
	busy: boolean;
}) => {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: `preset-slot:${slot.key}`,
		disabled: busy,
		data: { type: 'slot', slotKey: slot.key, fromRow: slot.row },
	});

	return (
		<Group
			ref={setNodeRef}
			gap="xs"
			wrap="nowrap"
			p="xs"
			style={{
				transform: CSS.Translate.toString(transform),
				opacity: isDragging ? 0.55 : 1,
				background: 'var(--app-surface-muted)',
				border: '1px solid var(--app-border)',
				cursor: busy ? 'default' : 'grab',
				touchAction: 'none',
				userSelect: 'none',
			}}
			{...(busy ? {} : { ...listeners, ...attributes })}
		>
			<HeroImage code={slot.heroClassCode} alt={slot.displayName} w={28} h={28} radius={0} />
			<Text size="sm" style={{ flex: 1 }} lineClamp={1}>
				{slot.displayName}
				{slot.size > 1 ? ` (${slot.size})` : ''}
			</Text>
			<Button
				size="compact-xs"
				variant="subtle"
				color="red"
				disabled={busy}
				onPointerDown={(event) => event.stopPropagation()}
				onClick={() => onRemove(slot.key)}
			>
				×
			</Button>
		</Group>
	);
};
