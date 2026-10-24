import { Button, Group, Modal, Stack, Table, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { fetchHeroes, type HeroClass } from '@/entities/hero';
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

type PresetsLibraryPageProps = {
	/** Только глобальные (админка). */
	mode: 'profile' | 'admin';
};

/**
 * Библиотека пресетов: личные + просмотр глобальных, либо CRUD глобальных в админке.
 */
export const PresetsLibraryPage = ({ mode }: PresetsLibraryPageProps) => {
	const navigate = useNavigate();
	const [player, setPlayer] = useState<Player | null>(null);
	const [heroes, setHeroes] = useState<HeroClass[]>([]);
	const [presets, setPresets] = useState<SquadPreset[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [editorOpen, setEditorOpen] = useState(false);
	const [editing, setEditing] = useState<SquadPreset | null>(null);

	const isAdminMode = mode === 'admin';
	const canEditGlobal = isAdminMode || player?.role === 'admin';

	const reload = async () => {
		const list = await fetchPresets({
			scope: isAdminMode ? 'global' : 'all',
		});
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
	}, [navigate, isAdminMode]);

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
					global: isAdminMode ? true : Boolean(input.global),
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
						items.map((preset) => (
							<Table.Tr key={preset.id}>
								<Table.Td>
									<Text fw={600}>{preset.name}</Text>
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
						))
					)}
				</Table.Tbody>
			</Table>
		</div>
	);

	return (
		<Stack gap="lg">
			<Group justify="space-between" wrap="wrap" gap="sm">
				<Text size="sm" c="var(--app-text-muted)">
					{isAdminMode
						? 'Глобальные пресеты видны всем игрокам в лобби.'
						: 'Свои пресеты можно править. Глобальные — готовые составы от команды.'}
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

			{isAdminMode ? (
				renderTable(globals, true)
			) : (
				<>
					<Stack gap="sm">
						<Text fw={600}>Мои</Text>
						{renderTable(mine, true)}
					</Stack>
					<Stack gap="sm">
						<Text fw={600}>Глобальные</Text>
						{renderTable(globals, canEditGlobal)}
					</Stack>
				</>
			)}

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
					allowGlobal={!isAdminMode && player?.role === 'admin'}
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
