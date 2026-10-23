import { Stack, Text, TextInput } from '@mantine/core';
import { useMemo, useState } from 'react';

import { CODEX_L, type EffectMeta, listBuffs, listDebuffs } from '@/features/battle';
import { getSceneUrl } from '@/shared/lib/staticUrl';
import { GoldRule } from '@/shared/ui/GoldRule';
import { OrnateFrame } from '@/shared/ui/OrnateFrame';
import { PageFrame } from '@/shared/ui/PageFrame';

import styles from './EffectsCodexPage.module.css';

/**
 * Справочник боевых эффектов (кодекс) — сетка и детальная панель.
 */
export const EffectsCodexPage = () => {
	const [query, setQuery] = useState('');
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const { filteredBuffs, filteredDebuffs, all, total, shown } = useMemo(() => {
		const buffs = listBuffs();
		const debuffs = listDebuffs();
		const q = query.trim().toLocaleLowerCase('ru');
		const match = (effect: EffectMeta) => {
			if (!q) {
				return true;
			}
			const hay = [effect.label, effect.description, effect.mechanics, effect.id]
				.join(' ')
				.toLocaleLowerCase('ru');
			return hay.includes(q);
		};
		const nextBuffs = buffs.filter(match);
		const nextDebuffs = debuffs.filter(match);
		const merged = [...nextBuffs, ...nextDebuffs];
		return {
			filteredBuffs: nextBuffs,
			filteredDebuffs: nextDebuffs,
			all: merged,
			total: buffs.length + debuffs.length,
			shown: merged.length,
		};
	}, [query]);

	const selected = all.find((effect) => effect.id === selectedId) ?? all[0] ?? null;

	const toolbar = (
		<div className={styles.listToolbar}>
			<TextInput
				placeholder="Поиск по названию, описанию, id…"
				value={query}
				onChange={(event) => setQuery(event.currentTarget.value)}
				aria-label="Поиск эффектов"
				className={styles.search}
			/>
			<Text size="sm" c="var(--app-text-muted)" className="sylvenarr-tabular">
				{shown === total ? `${total} эффектов` : `${shown} из ${total}`}
			</Text>
		</div>
	);

	return (
		<PageFrame
			width="wide"
			eyebrow="Справочник"
			title="Кодекс эффектов"
			lead="Баффы и дебаффы поля боя: как работают и что снимают."
			scene={getSceneUrl('effects.webp')}
		>
			{shown === 0 ? (
				<div className={styles.listColumn}>
					{toolbar}
					<Text c="var(--app-text-muted)">Ничего не найдено по запросу «{query.trim()}».</Text>
				</div>
			) : (
				<div className={styles.layout}>
					<div className={styles.listColumn}>
						{toolbar}
						<OrnateFrame variant="tabbed" tabLabel="Эффекты" className={styles.gridPanel}>
							{filteredBuffs.length > 0 ? (
								<EffectGrid
									title="Усиления"
									effects={filteredBuffs}
									selectedId={selected?.id ?? null}
									onSelect={setSelectedId}
								/>
							) : null}
							{filteredDebuffs.length > 0 ? (
								<EffectGrid
									title="Ослабления"
									effects={filteredDebuffs}
									selectedId={selected?.id ?? null}
									onSelect={setSelectedId}
								/>
							) : null}
						</OrnateFrame>
					</div>

					{selected ? (
						<OrnateFrame
							variant="medallion"
							className={styles.detailPanel}
							medallion={(() => {
								const Icon = selected.Icon;
								return <Icon size={28} strokeWidth={1.6} />;
							})()}
						>
							<Stack gap="sm" className={styles.detailBody}>
								<span className={styles.kind}>
									{selected.kind === 'buff' ? 'Усиление' : 'Ослабление'}
								</span>
								<h2 className={styles.detailTitle}>{selected.label}</h2>
								<GoldRule align="start" />
								<Text c="var(--app-text-muted)" style={{ lineHeight: 1.55 }}>
									{selected.description}
								</Text>
								<p className={styles.mechanics}>{selected.mechanics}</p>
								<Text size="sm" c="var(--app-text-muted)">
									Пример при L={CODEX_L}: {selected.exampleAtL}
								</Text>
							</Stack>
						</OrnateFrame>
					) : null}
				</div>
			)}
		</PageFrame>
	);
};

const EffectGrid = ({
	title,
	effects,
	selectedId,
	onSelect,
}: {
	title: string;
	effects: EffectMeta[];
	selectedId: string | null;
	onSelect: (id: string) => void;
}) => (
	<div className={styles.group}>
		<p className={styles.groupTitle}>{title}</p>
		<div className={styles.iconGrid} role="listbox" aria-label={title}>
			{effects.map((effect) => {
				const Icon = effect.Icon;
				const selected = effect.id === selectedId;
				return (
					<button
						key={effect.id}
						type="button"
						role="option"
						aria-selected={selected}
						aria-label={effect.label}
						className={styles.iconBtn}
						data-kind={effect.kind}
						data-selected={selected || undefined}
						onClick={() => onSelect(effect.id)}
					>
						<span className={styles.icon} aria-hidden>
							<Icon size={20} strokeWidth={1.75} />
						</span>
						<span className={styles.iconLabel}>{effect.label}</span>
					</button>
				);
			})}
		</div>
	</div>
);
