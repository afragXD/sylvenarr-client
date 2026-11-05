import { Anchor, Button, Group, Modal, Skeleton, Stack, Table, Tabs, Text } from '@mantine/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';

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
import { isStaffRole } from '@/shared/lib/staffRole';
import { useAc6DeferredLoad } from '@/shared/lib/useAc6DeferredLoad';
import { OrnateButton } from '@/shared/ui/OrnateButton';

import { PresetEditorForm } from './PresetEditorForm';

const firstSlot = (preset: SquadPreset) =>
	[...preset.slots].sort((a, b) => a.slotOrder - b.slotOrder)[0] ?? null;

type ProfilePresetsTab = 'personal' | 'global';

type BootPayload = {
	player: Player;
	heroes: HeroClass[];
	presets: SquadPreset[];
};

/**
 * Библиотека пресетов (AC-6: skeleton, 4–6 с retry, empty personal).
 */
export const PresetsLibraryPage = () => {
	const navigate = useNavigate();
	const [presets, setPresets] = useState<SquadPreset[]>([]);
	const [heroes, setHeroes] = useState<HeroClass[]>([]);
	const [player, setPlayer] = useState<Player | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [editorOpen, setEditorOpen] = useState(false);
	const [editing, setEditing] = useState<SquadPreset | null>(null);
	const [profileTab, setProfileTab] = useState<ProfilePresetsTab>('personal');

	const loadBoot = useCallback(async (): Promise<BootPayload | null> => {
		const me = await fetchCurrentPlayer();
		if (!me) {
			void navigate({ to: '/sign-in' });
			return null;
		}
		const [heroList, list] = await Promise.all([fetchHeroes(), fetchPresets({ scope: 'all' })]);
		return { player: me, heroes: heroList, presets: list };
	}, [navigate]);

	const { state, data, retry } = useAc6DeferredLoad(loadBoot, [loadBoot]);

	useEffect(() => {
		if (state !== 'ok' || !data) {
			return;
		}
		setPlayer(data.player);
		setHeroes(data.heroes);
		setPresets(data.presets);
	}, [state, data]);

	if (state === 'ok' && data === null) {
		return null;
	}

	const canEditGlobal = isStaffRole(player?.role);
	const mine = presets.filter((preset) => !preset.isGlobal);
	const globals = presets.filter((preset) => preset.isGlobal);

	const reload = async () => {
		const list = await fetchPresets({ scope: 'all' });
		setPresets(list);
	};

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

	if (state === 'loading') {
		return (
			<Stack gap="sm" maw={560} aria-busy>
				<Skeleton height={32} radius={0} />
				<Skeleton height={120} radius={0} />
				<Skeleton height={120} radius={0} />
			</Stack>
		);
	}

	if (state === 'error') {
		return (
			<Text c="var(--app-text-muted)" role="alert">
				Не удалось загрузить ·{' '}
				<Button variant="subtle" color="brand" size="compact-sm" radius={0} onClick={retry}>
					Повторить
				</Button>
			</Text>
		);
	}

	const renderTable = (items: SquadPreset[], editable: boolean, emptyPersonal: boolean) => (
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
								{emptyPersonal ? (
									<Stack gap={6}>
										<Text c="var(--app-text-muted)" size="sm">
											Пресетов пока нет. Сохраните отряд после драфта.
										</Text>
										<Anchor component={Link} to="/lobby" c="brand" size="sm" fw={600}>
											В лобби
										</Anchor>
									</Stack>
								) : (
									<Text c="var(--app-text-muted)" size="sm">
										Пока пусто
									</Text>
								)}
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
					disabled={busy || !player}
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
					{renderTable(mine, true, true)}
				</Tabs.Panel>
				<Tabs.Panel value="global" pt="sm">
					{renderTable(globals, Boolean(canEditGlobal), false)}
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
					allowGlobal={Boolean(canEditGlobal)}
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
