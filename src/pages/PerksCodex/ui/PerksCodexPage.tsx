import { Anchor, Group, Loader, Select, Stack, Text, TextInput } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import { categoryLabel, fetchPerks, type PerkBrief } from '@/entities/item';
import { PageFrame } from '@/shared/ui/PageFrame';

import styles from './PerksCodexPage.module.css';

const KIND_OPTIONS = [
	{ value: 'item', label: 'Предметные' },
	{ value: 'other', label: 'Прочие' },
];

/**
 * Кодекс перков — публичный каталог навыков ярмарки.
 */
export const PerksCodexPage = () => {
	const [perks, setPerks] = useState<PerkBrief[]>([]);
	const [pending, setPending] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [kind, setKind] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		setPending(true);
		setError(null);
		fetchPerks()
			.then((nextPerks) => {
				if (!cancelled) {
					setPerks(nextPerks);
				}
			})
			.catch((err: unknown) => {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Не удалось загрузить перки');
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

	const filteredPerks = useMemo(() => {
		const q = query.trim().toLocaleLowerCase('ru');
		return perks.filter((perk) => {
			if (kind && perk.kind !== kind) {
				return false;
			}
			if (!q) {
				return true;
			}
			const hay = [perk.name, perk.description, perk.id, perk.kind]
				.join(' ')
				.toLocaleLowerCase('ru');
			return hay.includes(q);
		});
	}, [perks, query, kind]);

	return (
		<PageFrame
			width="wide"
			eyebrow="Справочник"
			title="Кодекс перков"
			lead="Навыки ярмарки: что даёт каждый и какие предметы он открывает."
		>
			<Anchor component={Link} to="/heroes/items" size="sm" c="brand" w="fit-content">
				Кодекс предметов
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
							placeholder="Поиск по названию и описанию…"
							value={query}
							onChange={(event) => setQuery(event.currentTarget.value)}
							aria-label="Поиск перков"
						/>
						<Select
							className={styles.filterControl}
							label="Вид"
							placeholder="Все"
							clearable
							data={KIND_OPTIONS}
							value={kind}
							onChange={setKind}
						/>
						<Text size="sm" c="var(--app-text-muted)" className="sylvenarr-tabular" pb={6}>
							{filteredPerks.length === perks.length
								? `${perks.length} перков`
								: `${filteredPerks.length} из ${perks.length}`}
						</Text>
					</div>

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
									<h2 className={styles.perkName}>{perk.name}</h2>
									<p className={styles.perkDesc}>{perk.description}</p>
								</article>
							))}
						</div>
					)}
				</Stack>
			) : null}
		</PageFrame>
	);
};
