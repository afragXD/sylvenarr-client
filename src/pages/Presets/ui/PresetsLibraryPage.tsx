import { Button, Group, Modal, Stack, Table, Tabs, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { fetchHeroes, type HeroClass, HeroImage } from '@/entities/hero';
import { fetchCurrentPlayer, type Player } from '@/entities/player';
import {
	createPreset,
	deletePreset,
	fetchPresets,
	type SquadPreset,
	updatePreset,
} from '@/entities/presets';
import { ApiError } from '@/shared/api/http';
import { OrnateButton } from '@/shared/ui/OrnateButton';

import { PresetEditorForm } from './PresetEditorForm';

const firstSlot = (preset: SquadPreset) =>
	[...preset.slots].sort((a, b) => a.slotOrder - b.slotOrder)[0] ?? null;

type ProfilePresetsTab = 'personal' | 'global';

/**
 * Библиотека пресетов: личные (CRUD) + глобальные (просмотр; admin — CRUD).
 */
export const PresetsLibraryPage = () => {
	const navigate = useNavigate();
	const [player, setPlayer] = useState<Player | null>(null);
	const [heroes, setHeroes] = useState<HeroClass[]>([]);
	const [presets, setPresets] = useState<SquadPreset[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [editorOpen, setEditorOpen] = useState(false);
	const [editing, setEditing] = useState<SquadPreset | null>(null);
	const [profileTab, setProfileTab] = useState<ProfilePresetsTab>('personal');

	const canEditGlobal = player?.role === 'admin';

	const reload = async () => {
		const list = await fetchPresets({ scope: 'all' });
		setPresets(list);
	};

	useEffect(() => {
		let alive = true;
		void (async () => {
			try {
				const [me, heroList] = await Promise.all([fetchCurrentPlayer(), fetchHeroes()]);
				if (!alive) {
					return;
				}
				setPlayer(me);
				setHeroes(heroList);
				await reload();
			} catch {
				if (alive) {
					void navigate({ to: '/sign-in' });
				}
			}
		})();
		return () => {
			alive = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- boot once
	}, [navigate]);

	const mine = presets.filter((preset) => !preset.isGlobal);
	const globals = presets.filter((preset) => preset.isGlobal);

	const openCreate = () => {
		setEditing(null);
		setEditorOpen(true);
		setError(null);
	};

	const openEdit = (preset: SquadPreset) => {
		setEditing(preset);
		setEditorOpen(true);
		setError(null);
	};

	const handleDelete = async (preset: SquadPreset) => {
		if (!window.confirm(`Удалить «${preset.name}»?`)) {
			return;
		}
		setBusy(true);
		setError(null);
		try {
			await deletePreset(preset.id);
			await reload();
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Не удалось удалить');
		} finally {
			setBusy(false);
		}
	};

	const handleSubmit = async (input: {
		name: string;
		slots: { heroClassCode: string; row: number }[];
		global?: boolean;
	}) => {
		setBusy(true);
		setError(null);
		try {
			if (editing) {
				await updatePreset(editing.id, { name: input.name, slots: input.slots });
			} else {
				await createPreset({
					name: input.name,
					slots: input.slots,
					global: Boolean(input.global),
				});
			}
			setEditorOpen(false);
			setEditing(null);
			await reload();
		} finally {
			setBusy(false);
		}
	};

	const renderTable = (items: SquadPreset[], editable: boolean) => (
		<div className="sylvenarr-panel">
			<Table className="sylvenarr-registry-table" highlightOnHover>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Название</Table.Th>
						<Table.Th>Размер</Table.Th>
						<Table.Th>Состав</Table.Th>
						<Table.Th />
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{items.length === 0 ? (
						<Table.Tr>
							<Table.Td colSpan={4}>
								<Text c="var(--app-text-muted)" size="sm">
									Пока пусто
								</Text>
							</Table.Td>
						</Table.Tr>
					) : (
						items.map((preset) => {
							const lead = firstSlot(preset);
							return (
							<Table.Tr key={preset.id}>
								<Table.Td>
									<Group gap="sm" wrap="nowrap">
										{lead ? (
											<HeroImage
												code={lead.heroClassCode}
												alt={lead.displayName}
												w={36}
												h={36}
												radius={0}
											/>
										) : null}
										<Text fw={600}>{preset.name}</Text>
									</Group>
								</Table.Td>
								<Table.Td>{preset.teamSize}</Table.Td>
								<Table.Td>
									<Text size="sm" c="var(--app-text-muted)">
										{preset.slots.map((slot) => slot.displayName).join(', ')}
									</Text>
								</Table.Td>
								<Table.Td>
									{editable ? (
										<Group gap="xs" justify="flex-end">
											<Button
												size="compact-sm"
												variant="default"
												radius={0}
												disabled={busy}
												onClick={() => openEdit(preset)}
											>
												Править
											</Button>
											<Button
												size="compact-sm"
												variant="light"
												color="red"
												radius={0}
												disabled={busy}
												onClick={() => void handleDelete(preset)}
											>
												Удалить
											</Button>
										</Group>
									) : (
										<Text size="sm" c="var(--app-text-muted)" ta="right">
											Только просмотр
										</Text>
									)}
								</Table.Td>
							</Table.Tr>
							);
						})
					)}
				</Table.Tbody>
			</Table>
		</div>
	);

	return (
		<Stack gap="lg">
			<Group justify="space-between" wrap="wrap" gap="sm">
				<Text size="sm" c="var(--app-text-muted)">
					Свои пресеты можно править. Глобальные — готовые составы от команды
					{canEditGlobal ? ' (их тоже можно править)' : ''}.
				</Text>
				<OrnateButton
					variant="parchment"
					withDiamonds={false}
					size="sm"
					onClick={openCreate}
					disabled={busy}
				>
					Новый пресет
				</OrnateButton>
			</Group>
			{error ? (
				<Text c="red" role="alert">
					{error}
				</Text>
			) : null}

			<Tabs
				value={profileTab}
				onChange={(value) => {
					if (value === 'personal' || value === 'global') {
						setProfileTab(value);
					}
				}}
				radius={0}
			>
				<Tabs.List>
					<Tabs.Tab value="personal">Личные</Tabs.Tab>
					<Tabs.Tab value="global">Глобальные</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value="personal" pt="sm">
					{renderTable(mine, true)}
				</Tabs.Panel>
				<Tabs.Panel value="global" pt="sm">
					{renderTable(globals, canEditGlobal)}
				</Tabs.Panel>
			</Tabs>

			<Modal
				opened={editorOpen}
				onClose={() => {
					if (!busy) {
						setEditorOpen(false);
						setEditing(null);
					}
				}}
				title={editing ? 'Правка пресета' : 'Новый пресет'}
				size="lg"
				radius={0}
			>
				<PresetEditorForm
					heroes={heroes}
					initial={editing}
					allowGlobal={canEditGlobal}
					busy={busy}
					onSubmit={handleSubmit}
					onCancel={() => {
						setEditorOpen(false);
						setEditing(null);
					}}
				/>
			</Modal>
		</Stack>
	);
};
