import { Anchor, Group, Loader, Select, Stack, Table, Text, TextInput } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import {
	categoryLabel,
	fetchItems,
	ITEM_CATEGORY_LABEL,
	ITEM_TARGET_LABEL,
	type ItemBrief,
} from '@/entities/item';
import { ItemGlyph } from '@/shared/ui/ItemGlyph';
import { PageFrame } from '@/shared/ui/PageFrame';

import styles from './ItemsCodexPage.module.css';

/**
 * Кодекс предметов — публичный каталог ярмарки.
 */
export const ItemsCodexPage = () => {
	const [items, setItems] = useState<ItemBrief[]>([]);
	const [pending, setPending] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState<string | null>(null);
	const [tier, setTier] = useState<string | null>(null);
	const [target, setTarget] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		setPending(true);
		setError(null);
		fetchItems()
			.then((nextItems) => {
				if (!cancelled) {
					setItems(nextItems);
				}
			})
			.catch((err: unknown) => {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Не удалось загрузить предметы');
				}
			})
			.finally(() => {
				if (!cancelled) {
					setPending(false);
				}
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const tierOptions = useMemo(() => {
		const set = new Set(items.map((item) => item.tier));
		return [...set]
			.sort((a, b) => a - b)
			.map((value) => ({ value: String(value), label: `Тир ${value}` }));
	}, [items]);

	const categoryOptions = useMemo(
		() =>
			Object.entries(ITEM_CATEGORY_LABEL).map(([value, label]) => ({
				value,
				label,
			})),
		[],
	);

	const targetOptions = useMemo(() => {
		const set = new Set(items.map((item) => item.target));
		return [...set]
			.sort((a, b) => (ITEM_TARGET_LABEL[a] ?? a).localeCompare(ITEM_TARGET_LABEL[b] ?? b, 'ru'))
			.map((value) => ({ value, label: ITEM_TARGET_LABEL[value] ?? value }));
	}, [items]);

	const filteredItems = useMemo(() => {
		const q = query.trim().toLocaleLowerCase('ru');
		const categoryNum = category ? Number(category) : null;
		const tierNum = tier ? Number(tier) : null;
		return items.filter((item) => {
			if (categoryNum !== null && item.category !== categoryNum) {
				return false;
			}
			if (tierNum !== null && item.tier !== tierNum) {
				return false;
			}
			if (target && item.target !== target) {
				return false;
			}
			if (!q) {
				return true;
			}
			const hay = [item.name, item.description, String(item.code), categoryLabel(item.category)]
				.join(' ')
				.toLocaleLowerCase('ru');
			return hay.includes(q);
		});
	}, [items, query, category, tier, target]);

	return (
		<PageFrame
			width="wide"
			eyebrow="Справочник"
			title="Кодекс предметов"
			lead="Каталог ярмарки: категории, тиры и на кого действует предмет."
		>
			<Anchor component={Link} to="/heroes/perks" size="sm" c="brand" w="fit-content">
				Кодекс перков
			</Anchor>

			{pending ? (
				<Group justify="center" py="xl">
					<Loader color="brand" />
				</Group>
			) : null}

			{error ? <Text c="var(--app-text-muted)">{error}</Text> : null}

			{!pending && !error ? (
				<Stack gap="xl">
					<div className={styles.filters}>
						<TextInput
							className={styles.search}
							placeholder="Поиск по названию, описанию, коду…"
							value={query}
							onChange={(event) => setQuery(event.currentTarget.value)}
							aria-label="Поиск предметов"
						/>
						<Select
							className={styles.filterControl}
							label="Категория"
							placeholder="Все"
							clearable
							data={categoryOptions}
							value={category}
							onChange={setCategory}
						/>
						<Select
							className={styles.filterControl}
							label="Тир"
							placeholder="Все"
							clearable
							data={tierOptions}
							value={tier}
							onChange={setTier}
						/>
						<Select
							className={styles.filterControl}
							label="Цель"
							placeholder="Все"
							clearable
							data={targetOptions}
							value={target}
							onChange={setTarget}
						/>
						<Text size="sm" c="var(--app-text-muted)" className="sylvenarr-tabular" pb={6}>
							{filteredItems.length === items.length
								? `${items.length} предметов`
								: `${filteredItems.length} из ${items.length}`}
						</Text>
					</div>

					<section className={styles.section} aria-label="Предметы">
						{filteredItems.length === 0 ? (
							<Text c="var(--app-text-muted)">Ничего не найдено.</Text>
						) : (
							<div className={styles.tableWrap}>
								<Table
									className="sylvenarr-registry-table"
									highlightOnHover
									horizontalSpacing="md"
									verticalSpacing="sm"
									ff="var(--mantine-font-family-monospace)"
									style={{
										borderCollapse: 'collapse',
										width: '100%',
										minWidth: 720,
									}}
								>
									<Table.Thead>
										<Table.Tr
											style={{
												borderBottom: '1px solid var(--app-border)',
												background: 'var(--app-surface)',
											}}
										>
											<Table.Th>Предмет</Table.Th>
											<Table.Th>Код</Table.Th>
											<Table.Th>Категория</Table.Th>
											<Table.Th>Тир</Table.Th>
											<Table.Th>Цена</Table.Th>
											<Table.Th>Цель</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{filteredItems.map((item) => (
											<Table.Tr key={item.code}>
												<Table.Td>
													<div className={styles.itemCell}>
														<ItemGlyph
															category={item.category}
															tier={item.tier}
															size={28}
															title={categoryLabel(item.category)}
														/>
														<div>
															<div className={styles.itemName}>{item.name}</div>
															<div className={styles.muted}>{item.description}</div>
														</div>
													</div>
												</Table.Td>
												<Table.Td className="sylvenarr-tabular">{item.code}</Table.Td>
												<Table.Td>{categoryLabel(item.category)}</Table.Td>
												<Table.Td className="sylvenarr-tabular">{item.tier}</Table.Td>
												<Table.Td className="sylvenarr-tabular">{item.cost}</Table.Td>
												<Table.Td>
													{ITEM_TARGET_LABEL[item.target] ?? item.target}
													{item.sellOnly ? ' · продажа' : ''}
												</Table.Td>
											</Table.Tr>
										))}
									</Table.Tbody>
								</Table>
							</div>
						)}
					</section>
				</Stack>
			) : null}
		</PageFrame>
	);
};
