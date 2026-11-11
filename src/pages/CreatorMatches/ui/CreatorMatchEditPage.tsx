import { Button, Group, NumberInput, Select, SimpleGrid, Stack, Table, Text } from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import {
	type CreatorEditorUnit,
	type CreatorInventoryStack,
	type CreatorMatchDetail,
	type CreatorUnitPatch,
	fetchCreatorMatch,
	patchCreatorTeamInventory,
	patchCreatorUnit,
} from '@/entities/creatorMatch';
import { fetchItems, type ItemBrief } from '@/entities/item';
import { ItemGlyph } from '@/shared/ui/ItemGlyph';
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
type InventoryDraft = CreatorInventoryStack[];

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

const cloneStacks = (stacks: readonly CreatorInventoryStack[]): InventoryDraft =>
	stacks.map((stack) => ({ ...stack }));

type TeamInventoryEditorProps = {
	readonly label: string;
	readonly gold: number;
	readonly draft: InventoryDraft;
	readonly catalog: readonly ItemBrief[];
	readonly saving: boolean;
	readonly onChange: (next: InventoryDraft) => void;
	readonly onSave: () => void;
};

const TeamInventoryEditor = ({
	label,
	gold,
	draft,
	catalog,
	saving,
	onChange,
	onSave,
}: TeamInventoryEditorProps) => {
	const [addCode, setAddCode] = useState<string | null>(null);
	const [addQty, setAddQty] = useState(1);

	const options = useMemo(
		() =>
			catalog.map((item) => ({
				value: String(item.code),
				label: `${item.name} (${item.code})`,
			})),
		[catalog],
	);

	const setQuantity = (code: number, quantity: number) => {
		const qty = Math.max(0, Math.trunc(quantity));
		if (qty === 0) {
			onChange(draft.filter((stack) => stack.code !== code));
			return;
		}
		onChange(draft.map((stack) => (stack.code === code ? { ...stack, quantity: qty } : stack)));
	};

	const removeStack = (code: number) => {
		onChange(draft.filter((stack) => stack.code !== code));
	};

	const addStack = () => {
		if (addCode == null) {
			return;
		}
		const code = Number(addCode);
		const item = catalog.find((entry) => entry.code === code);
		if (!item || !Number.isFinite(code)) {
			return;
		}
		const qty = Math.max(1, Math.trunc(addQty));
		const existing = draft.find((stack) => stack.code === code);
		if (existing) {
			onChange(
				draft.map((stack) =>
					stack.code === code ? { ...stack, quantity: stack.quantity + qty } : stack,
				),
			);
		} else {
			onChange([
				...draft,
				{
					code: item.code,
					name: item.name,
					description: item.description,
					quantity: qty,
					category: item.category,
					tier: item.tier,
					target: item.target,
				},
			]);
		}
		setAddCode(null);
		setAddQty(1);
	};

	return (
		<Stack gap="sm">
			<Group justify="space-between">
				<Text fw={600} size="sm">
					{label}
				</Text>
				<Text size="xs" c="dimmed">
					Золото: {gold}
				</Text>
			</Group>
			{draft.length === 0 ? (
				<Text size="sm" c="dimmed">
					Пусто
				</Text>
			) : (
				<Stack gap="xs">
					{draft.map((stack) => (
						<Group key={stack.code} gap="sm" wrap="nowrap" align="center">
							<ItemGlyph
								code={stack.code}
								category={stack.category}
								tier={stack.tier}
								quantity={stack.quantity}
								size={36}
								title={stack.name}
							/>
							<Text size="sm" style={{ flex: 1, minWidth: 0 }} truncate title={stack.name}>
								{stack.name}
							</Text>
							<NumberInput
								value={stack.quantity}
								min={0}
								w={72}
								size="xs"
								onChange={(value) => {
									const num = typeof value === 'number' ? value : Number(value);
									if (!Number.isFinite(num)) {
										return;
									}
									setQuantity(stack.code, num);
								}}
							/>
							<Button variant="default" size="compact-xs" onClick={() => removeStack(stack.code)}>
								✕
							</Button>
						</Group>
					))}
				</Stack>
			)}
			<Group align="flex-end" grow preventGrowOverflow={false}>
				<Select
					label="Предмет"
					placeholder="Поиск…"
					searchable
					clearable
					data={options}
					value={addCode}
					onChange={setAddCode}
					size="xs"
					style={{ flex: 1, minWidth: 160 }}
				/>
				<NumberInput
					label="Кол-во"
					value={addQty}
					min={1}
					w={80}
					size="xs"
					onChange={(value) => {
						const num = typeof value === 'number' ? value : Number(value);
						if (!Number.isFinite(num)) {
							return;
						}
						setAddQty(Math.max(1, Math.trunc(num)));
					}}
				/>
				<Button size="compact-sm" variant="light" onClick={addStack} disabled={addCode == null}>
					Добавить
				</Button>
			</Group>
			<Group>
				<Button onClick={onSave} loading={saving} size="compact-sm">
					Сохранить инвентарь
				</Button>
			</Group>
		</Stack>
	);
};

export const CreatorMatchEditPage = () => {
	const { id } = useParams({ from: '/creator/matches/$id' });
	const [detail, setDetail] = useState<CreatorMatchDetail | null>(null);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [draft, setDraft] = useState<Draft | null>(null);
	const [invDrafts, setInvDrafts] = useState<[InventoryDraft, InventoryDraft]>([[], []]);
	const [catalog, setCatalog] = useState<ItemBrief[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [savingTeam, setSavingTeam] = useState<0 | 1 | null>(null);

	const applyDetail = (next: CreatorMatchDetail, keepId: string | null) => {
		setDetail(next);
		const keep =
			keepId && next.units.some((unit) => unit.id === keepId)
				? keepId
				: (next.units[0]?.id ?? null);
		setSelectedId(keep);
		const unit = next.units.find((item) => item.id === keep) ?? null;
		setDraft(unit ? draftFromUnit(unit) : null);
		setInvDrafts([cloneStacks(next.teams[0].inventory), cloneStacks(next.teams[1].inventory)]);
	};

	const reload = () => {
		setError(null);
		void fetchCreatorMatch(id)
			.then((next) => {
				applyDetail(next, selectedId);
			})
			.catch((err: unknown) => {
				setError(err instanceof Error ? err.message : 'Ошибка загрузки');
			});
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: reload only when match id changes
	useEffect(() => {
		setError(null);
		void fetchCreatorMatch(id)
			.then((next) => {
				applyDetail(next, null);
			})
			.catch((err: unknown) => {
				setError(err instanceof Error ? err.message : 'Ошибка загрузки');
			});
	}, [id]);

	useEffect(() => {
		void fetchItems()
			.then(setCatalog)
			.catch(() => {
				/* каталог опционален для просмотра; добавление без него недоступно */
			});
	}, []);

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
			applyDetail(next, selectedId);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Не удалось сохранить');
		} finally {
			setSaving(false);
		}
	};

	const handleSaveInventory = async (team: 0 | 1) => {
		setSavingTeam(team);
		setError(null);
		try {
			const next = await patchCreatorTeamInventory(
				id,
				team,
				invDrafts[team].map((stack) => ({
					code: stack.code,
					quantity: stack.quantity,
				})),
			);
			applyDetail(next, selectedId);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Не удалось сохранить инвентарь');
		} finally {
			setSavingTeam(null);
		}
	};

	return (
		<PageFrame
			title={detail ? `${detail.hostDisplayName} vs ${detail.guestDisplayName ?? '—'}` : 'Матч'}
			eyebrow="Креатор"
			lead={detail ? `Раунд ${detail.stage} · фаза ${detail.phase}` : 'Загрузка снимка боя…'}
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
									background: unit.id === selectedId ? 'var(--mantine-color-dark-6)' : undefined,
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
			{detail ? (
				<Stack gap="md">
					<Text fw={600} size="sm">
						Инвентари
					</Text>
					<Text size="xs" c="dimmed">
						Полная замена сумки отряда. В боевой лог не пишется.
					</Text>
					<SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
						<TeamInventoryEditor
							label="Хост"
							gold={detail.teams[0].gold}
							draft={invDrafts[0]}
							catalog={catalog}
							saving={savingTeam === 0}
							onChange={(next) => setInvDrafts((prev) => [next, prev[1]])}
							onSave={() => void handleSaveInventory(0)}
						/>
						<TeamInventoryEditor
							label="Гость"
							gold={detail.teams[1].gold}
							draft={invDrafts[1]}
							catalog={catalog}
							saving={savingTeam === 1}
							onChange={(next) => setInvDrafts((prev) => [prev[0], next])}
							onSave={() => void handleSaveInventory(1)}
						/>
					</SimpleGrid>
				</Stack>
			) : null}
		</PageFrame>
	);
};
