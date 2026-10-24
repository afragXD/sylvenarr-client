import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';

import { fetchPresets, type SquadPreset } from '@/entities/presets';
import { ApiError } from '@/shared/api/http';

type DraftPresetModalProps = {
	opened: boolean;
	teamSize: number;
	busy: boolean;
	onClose: () => void;
	onPick: (presetId: string) => void;
};

/**
 * Выбор личного или глобального пресета для применения в draft.
 */
export const DraftPresetModal = ({
	opened,
	teamSize,
	busy,
	onClose,
	onPick,
}: DraftPresetModalProps) => {
	const [presets, setPresets] = useState<SquadPreset[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!opened) {
			return;
		}
		let alive = true;
		setLoading(true);
		setError(null);
		void fetchPresets({ teamSize, scope: 'all' })
			.then((list) => {
				if (alive) {
					setPresets(list);
				}
			})
			.catch((err: unknown) => {
				if (alive) {
					setError(err instanceof ApiError ? err.message : 'Не удалось загрузить пресеты');
				}
			})
			.finally(() => {
				if (alive) {
					setLoading(false);
				}
			});
		return () => {
			alive = false;
		};
	}, [opened, teamSize]);

	const mine = presets.filter((preset) => !preset.isGlobal);
	const globals = presets.filter((preset) => preset.isGlobal);

	const section = (title: string, items: SquadPreset[]) => (
		<Stack gap="xs">
			<Text fw={600} size="sm">
				{title}
			</Text>
			{items.length === 0 ? (
				<Text size="sm" c="var(--app-text-muted)">
					Нет пресетов на {teamSize}
				</Text>
			) : (
				items.map((preset) => (
					<Group key={preset.id} justify="space-between" wrap="nowrap" gap="sm">
						<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
							<Text fw={600} lineClamp={1}>
								{preset.name}
							</Text>
							<Text size="xs" c="var(--app-text-muted)" lineClamp={2}>
								{preset.slots.map((slot) => slot.displayName).join(', ')}
							</Text>
						</Stack>
						<Button
							size="compact-sm"
							color="brand"
							disabled={busy || loading}
							onClick={() => onPick(preset.id)}
						>
							Взять
						</Button>
					</Group>
				))
			)}
		</Stack>
	);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title="Пресет отряда"
			size="md"
			radius={0}
			closeOnClickOutside={!busy}
			closeOnEscape={!busy}
		>
			<Stack gap="lg">
				<Text size="sm" c="var(--app-text-muted)">
					Состав сопернику не покажется, пока не начнётся бой. Пресет можно взять только с пустым
					отрядом.
				</Text>
				{error ? (
					<Text c="red" role="alert">
						{error}
					</Text>
				) : null}
				{loading ? (
					<Text c="var(--app-text-muted)">Загрузка…</Text>
				) : (
					<>
						{section('Мои', mine)}
						{section('Глобальные', globals)}
					</>
				)}
			</Stack>
		</Modal>
	);
};
