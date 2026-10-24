import { Button, Group, Modal, Stack, Tabs, Text } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';

import { HeroImage } from '@/entities/hero';
import { fetchPresets, type SquadPreset } from '@/entities/presets';
import { ApiError } from '@/shared/api/http';

type DraftPresetModalProps = {
	opened: boolean;
	teamSize: number;
	busy: boolean;
	onClose: () => void;
	onPick: (presetId: string) => void;
};

type PresetTab = 'personal' | 'global';

const firstSlot = (preset: SquadPreset) =>
	[...preset.slots].sort((a, b) => a.slotOrder - b.slotOrder)[0] ?? null;

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
	const [tab, setTab] = useState<PresetTab>('personal');

	useEffect(() => {
		if (!opened) {
			return;
		}
		let alive = true;
		setLoading(true);
		setError(null);
		void fetchPresets({ teamSize, scope: 'all' })
			.then((list) => {
				if (!alive) {
					return;
				}
				setPresets(list);
				const hasMine = list.some((preset) => !preset.isGlobal);
				setTab(hasMine ? 'personal' : 'global');
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

	const mine = useMemo(() => presets.filter((preset) => !preset.isGlobal), [presets]);
	const globals = useMemo(() => presets.filter((preset) => preset.isGlobal), [presets]);
	const showTabs = mine.length > 0;

	const list = (items: SquadPreset[]) =>
		items.length === 0 ? (
			<Text size="sm" c="var(--app-text-muted)">
				Нет пресетов на {teamSize}
			</Text>
		) : (
			<Stack gap="xs">
				{items.map((preset) => {
					const lead = firstSlot(preset);
					return (
						<Group key={preset.id} justify="space-between" wrap="nowrap" gap="sm">
							<Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
								{lead ? (
									<HeroImage
										code={lead.heroClassCode}
										alt={lead.displayName}
										w={40}
										h={40}
										radius={0}
									/>
								) : null}
								<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
									<Text fw={600} lineClamp={1}>
										{preset.name}
									</Text>
									<Text size="xs" c="var(--app-text-muted)" lineClamp={2}>
										{preset.slots.map((slot) => slot.displayName).join(', ')}
									</Text>
								</Stack>
							</Group>
							<Button
								size="compact-sm"
								color="brand"
								disabled={busy || loading}
								onClick={() => onPick(preset.id)}
							>
								Взять
							</Button>
						</Group>
					);
				})}
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
				) : showTabs ? (
					<Tabs
						value={tab}
						onChange={(value) => {
							if (value === 'personal' || value === 'global') {
								setTab(value);
							}
						}}
						radius={0}
					>
						<Tabs.List>
							<Tabs.Tab value="personal">Личные</Tabs.Tab>
							<Tabs.Tab value="global">Глобальные</Tabs.Tab>
						</Tabs.List>
						<Tabs.Panel value="personal" pt="sm">
							{list(mine)}
						</Tabs.Panel>
						<Tabs.Panel value="global" pt="sm">
							{list(globals)}
						</Tabs.Panel>
					</Tabs>
				) : (
					list(globals)
				)}
			</Stack>
		</Modal>
	);
};
