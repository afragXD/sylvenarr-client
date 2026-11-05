import { Button, Group, NumberInput, Stack, Table, Text } from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import {
	type CreatorEditorUnit,
	type CreatorMatchDetail,
	type CreatorUnitPatch,
	fetchCreatorMatch,
	patchCreatorUnit,
} from '@/entities/creatorMatch';
import { PageFrame } from '@/shared/ui/PageFrame';

const STAT_FIELDS = [
	{ key: 'health', label: 'HP' },
	{ key: 'maxHp', label: 'maxHP' },
	{ key: 'damage', label: 'ATK' },
	{ key: 'armor', label: 'ARM' },
	{ key: 'initiative', label: 'INI' },
	{ key: 'dodge', label: 'DOD' },
	{ key: 'luck', label: 'LCK' },
	{ key: 'accuracy', label: 'ACC' },
	{ key: 'power', label: 'POW' },
	{ key: 'mana', label: 'MP' },
	{ key: 'maxMana', label: 'maxMP' },
	{ key: 'morale', label: 'MOR' },
	{ key: 'lvl', label: 'LVL' },
	{ key: 'ultaCharges', label: 'ULT' },
	{ key: 'critBank', label: 'CRIT' },
] as const satisfies ReadonlyArray<{ key: keyof CreatorUnitPatch; label: string }>;

type Draft = Record<(typeof STAT_FIELDS)[number]['key'], number>;

const draftFromUnit = (unit: CreatorEditorUnit): Draft => ({
	health: unit.health,
	maxHp: unit.maxHp,
	damage: unit.damage,
	armor: unit.armor,
	initiative: unit.initiative,
	dodge: unit.dodge,
	luck: unit.luck,
	accuracy: unit.accuracy,
	power: unit.power,
	mana: unit.mana,
	maxMana: unit.maxMana,
	morale: unit.morale,
	lvl: unit.lvl,
	ultaCharges: unit.ultaCharges,
	critBank: unit.critBank,
});

export const CreatorMatchEditPage = () => {
	const { id } = useParams({ from: '/creator/matches/$id' });
	const [detail, setDetail] = useState<CreatorMatchDetail | null>(null);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [draft, setDraft] = useState<Draft | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	const reload = () => {
		setError(null);
		void fetchCreatorMatch(id)
			.then((next) => {
				setDetail(next);
				const keep =
					selectedId && next.units.some((unit) => unit.id === selectedId)
						? selectedId
						: (next.units[0]?.id ?? null);
				setSelectedId(keep);
				const unit = next.units.find((item) => item.id === keep) ?? null;
				setDraft(unit ? draftFromUnit(unit) : null);
			})
			.catch((err: unknown) => {
				setError(err instanceof Error ? err.message : 'Ошибка загрузки');
			});
	};

	useEffect(() => {
		reload();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- initial load by match id
	}, [id]);

	const selectUnit = (unit: CreatorEditorUnit) => {
		setSelectedId(unit.id);
		setDraft(draftFromUnit(unit));
		setError(null);
	};

	const handleSave = async () => {
		if (!selectedId || !draft || !detail) {
			return;
		}
		const unit = detail.units.find((item) => item.id === selectedId);
		if (!unit) {
			return;
		}
		const patch: CreatorUnitPatch = {};
		for (const field of STAT_FIELDS) {
			const next = draft[field.key];
			const prev = unit[field.key];
			if (next !== prev) {
				patch[field.key] = next;
			}
		}
		if (Object.keys(patch).length === 0) {
			setError('Нет изменений');
			return;
		}
		setSaving(true);
		setError(null);
		try {
			const next = await patchCreatorUnit(id, selectedId, patch);
			setDetail(next);
			const updated = next.units.find((item) => item.id === selectedId) ?? null;
			setDraft(updated ? draftFromUnit(updated) : null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Не удалось сохранить');
		} finally {
			setSaving(false);
		}
	};

	return (
		<PageFrame
			title={
				detail
					? `${detail.hostDisplayName} vs ${detail.guestDisplayName ?? '—'}`
					: 'Матч'
			}
			eyebrow="Креатор"
			lead={
				detail
					? `Раунд ${detail.stage} · фаза ${detail.phase}`
					: 'Загрузка снимка боя…'
			}
			width="wide"
		>
			<Group justify="space-between">
				<Button component={Link} to="/creator/matches" variant="default" size="compact-sm">
					← К списку
				</Button>
				<Button variant="default" size="compact-sm" onClick={reload}>
					Обновить
				</Button>
			</Group>
			{error ? (
				<Text c="red" size="sm">
					{error}
				</Text>
			) : null}
			{detail ? (
				<Table striped highlightOnHover withTableBorder>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Команда</Table.Th>
							<Table.Th>Имя</Table.Th>
							<Table.Th>Класс</Table.Th>
							<Table.Th>HP</Table.Th>
							<Table.Th>LVL</Table.Th>
							<Table.Th>ATK</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{detail.units.map((unit) => (
							<Table.Tr
								key={unit.id}
								style={{
									cursor: 'pointer',
									background:
										unit.id === selectedId ? 'var(--mantine-color-dark-6)' : undefined,
								}}
								onClick={() => selectUnit(unit)}
							>
								<Table.Td>{unit.team === 0 ? 'Хост' : 'Гость'}</Table.Td>
								<Table.Td>
									{unit.displayName}
									{!unit.alive ? ' †' : ''}
									{unit.isSummon ? ' ✦' : ''}
								</Table.Td>
								<Table.Td>{unit.heroClassCode}</Table.Td>
								<Table.Td>
									{unit.health}/{unit.maxHp}
								</Table.Td>
								<Table.Td>{unit.lvl}</Table.Td>
								<Table.Td>{unit.damage}</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			) : null}
			{draft && selectedId ? (
				<Stack gap="sm">
					<Text fw={600} size="sm">
						Правка статов
					</Text>
					<Group grow preventGrowOverflow={false} align="flex-end">
						{STAT_FIELDS.map((field) => (
							<NumberInput
								key={field.key}
								label={field.label}
								value={draft[field.key]}
								onChange={(value) => {
									const num = typeof value === 'number' ? value : Number(value);
									if (!Number.isFinite(num)) {
										return;
									}
									setDraft((prev) => (prev ? { ...prev, [field.key]: num } : prev));
								}}
								size="xs"
							/>
						))}
					</Group>
					<Group>
						<Button onClick={() => void handleSave()} loading={saving}>
							Сохранить
						</Button>
						<Text size="xs" c="dimmed">
							hiddenLvl ≥ lvl при повышении уровня; HP clamp к maxHP.
						</Text>
					</Group>
				</Stack>
			) : null}
		</PageFrame>
	);
};
