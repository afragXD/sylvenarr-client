import { Group, Loader, Select, Stack, Table, Text, TextInput } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';

import {
	categoryLabel,
	fetchItems,
	fetchPerks,
	ITEM_CATEGORY_LABEL,
	ITEM_TARGET_LABEL,
	type ItemBrief,
	type PerkBrief,
} from '@/entities/item';
import { getSceneUrl } from '@/shared/lib/staticUrl';
import { ItemGlyph } from '@/shared/ui/ItemGlyph';
import { PageFrame } from '@/shared/ui/PageFrame';

import styles from './ItemsCodexPage.module.css';

/**
 * Кодекс предметов и перков — публичные каталоги с фильтрами.
 */
export const ItemsCodexPage = () => {
	const [items, setItems] = useState<ItemBrief[]>([]);
	const [perks, setPerks] = useState<PerkBrief[]>([]);
	const [pending, setPending] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState<string | null>(null);
	const [tier, setTier] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		setPending(true);
		setError(null);
		Promise.all([fetchItems(), fetchPerks()])
			.then(([nextItems, nextPerks]) => {
				if (cancelled) {
					return;
				}
				setItems(nextItems);
				setPerks(nextPerks);
			})
			.catch((err: unknown) => {
				if (cancelled) {
					return;
				}
				setError(err instanceof Error ? err.message : 'Не удалось загрузить каталоги');
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
			if (!q) {
				return true;
			}
			const hay = [item.name, item.description, String(item.code), categoryLabel(item.category)]
				.join(' ')
				.toLocaleLowerCase('ru');
			return hay.includes(q);
		});
	}, [items, query, category, tier]);

	const filteredPerks = useMemo(() => {
		const q = query.trim().toLocaleLowerCase('ru');
		if (!q) {
			return perks;
		}
		return perks.filter((perk) => {
			const hay = [perk.name, perk.description, perk.id, perk.kind]
				.join(' ')
				.toLocaleLowerCase('ru');
			return hay.includes(q);
		});
	}, [perks, query]);

	return (
		<PageFrame
			width="wide"
			eyebrow="Справочник"
			title="Кодекс предметов"
			lead="Каталог ярмарки и перки: категории, тиры и что даёт каждый навык."
			scene={getSceneUrl('effects.webp')}
		>
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
							aria-label="Поиск предметов и перков"
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
						<Text size="sm" c="var(--app-text-muted)" className="sylvenarr-tabular" pb={6}>
							{filteredItems.length === items.length
								? `${items.length} предметов`
								: `${filteredItems.length} из ${items.length}`}
							{' · '}
							{filteredPerks.length === perks.length
								? `${perks.length} перков`
								: `${filteredPerks.length} из ${perks.length}`}
						</Text>
					</div>

					<section className={styles.section} aria-labelledby="items-codex-items">
						<h2 id="items-codex-items" className={styles.sectionTitle}>
							Предметы
						</h2>
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

					<section className={styles.section} aria-labelledby="items-codex-perks">
						<h2 id="items-codex-perks" className={styles.sectionTitle}>
							Перки
						</h2>
						{filteredPerks.length === 0 ? (
							<Text c="var(--app-text-muted)">Ничего не найдено.</Text>
						) : (
							<div className={styles.perkGrid}>
								{filteredPerks.map((perk) => (
									<article key={perk.id} className={styles.perkCard}>
										<span className={styles.perkKind}>
											{perk.kind === 'item'
												? `Предметы${perk.category ? ` · ${categoryLabel(perk.category)}` : ''}`
												: 'Прочий'}
										</span>
										<h3 className={styles.perkName}>{perk.name}</h3>
										<p className={styles.perkDesc}>{perk.description}</p>
									</article>
								))}
							</div>
						)}
					</section>
				</Stack>
			) : null}
		</PageFrame>
	);
};
