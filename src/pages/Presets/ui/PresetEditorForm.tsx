import { Button, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { useMemo, useState } from 'react';

import { type HeroClass, HeroImage } from '@/entities/hero';
import type { SquadPreset, SquadPresetSlotInput } from '@/entities/presets';

const ROW_FRONT = 0;
const ROW_BACK = 1;

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
	const [row, setRow] = useState<number>(ROW_FRONT);
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
		const rowCount = slots.filter((slot) => slot.row === row).length;
		if (rowCount >= 3) {
			setError('На этом ряду нет места');
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
				row,
				displayName: hero.displayName,
				size: hero.size,
			},
		]);
	};

	const removeSlot = (key: string) => {
		setSlots((prev) => prev.filter((slot) => slot.key !== key));
		setError(null);
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
				Размер: {teamSize}/6 (минимум 3). Ряд для добавления:{' '}
				{row === ROW_FRONT ? 'передний' : 'задний'}.
			</Text>
			<Group gap="xs">
				<Button
					size="compact-sm"
					variant={row === ROW_FRONT ? 'filled' : 'default'}
					color="brand"
					onClick={() => setRow(ROW_FRONT)}
					disabled={busy}
				>
					Передний ряд
				</Button>
				<Button
					size="compact-sm"
					variant={row === ROW_BACK ? 'filled' : 'default'}
					color="brand"
					onClick={() => setRow(ROW_BACK)}
					disabled={busy}
				>
					Задний ряд
				</Button>
			</Group>
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
			<Group align="flex-start" gap="xl" wrap="wrap">
				<SlotColumn title="Передний ряд" items={front} onRemove={removeSlot} busy={busy} />
				<SlotColumn title="Задний ряд" items={back} onRemove={removeSlot} busy={busy} />
			</Group>
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
	title,
	items,
	onRemove,
	busy,
}: {
	title: string;
	items: DraftSlot[];
	onRemove: (key: string) => void;
	busy: boolean;
}) => (
	<Stack gap="xs" miw={200}>
		<Text fw={600} size="sm">
			{title}
		</Text>
		{items.length === 0 ? (
			<Text size="sm" c="var(--app-text-muted)">
				Пусто
			</Text>
		) : (
			items.map((slot) => (
				<Group key={slot.key} gap="xs" wrap="nowrap">
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
						onClick={() => onRemove(slot.key)}
					>
						×
					</Button>
				</Group>
			))
		)}
	</Stack>
);
