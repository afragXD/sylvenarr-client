import { Anchor, Group, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { CODEX_L, type EffectMeta, listBuffs, listDebuffs } from '@/features/battle';
import { PageFrame } from '@/shared/ui/PageFrame';

import styles from './EffectsCodexPage.module.css';

/**
 * Справочник боевых эффектов (кодекс).
 */
export const EffectsCodexPage = () => {
	const [query, setQuery] = useState('');
	const { filteredBuffs, filteredDebuffs, total, shown } = useMemo(() => {
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
		return {
			filteredBuffs: nextBuffs,
			filteredDebuffs: nextDebuffs,
			total: buffs.length + debuffs.length,
			shown: nextBuffs.length + nextDebuffs.length,
		};
	}, [query]);

	return (
		<PageFrame width="content">
			<Anchor
				component={Link}
				to="/heroes"
				c="brand"
				td="none"
				size="sm"
				fw={500}
				w="fit-content"
				display="inline-block"
			>
				← К реестру
			</Anchor>

			<Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
				<Stack gap={8} maw="40rem">
					<Title order={1}>Кодекс эффектов</Title>
					<Text c="var(--app-text-muted)" style={{ lineHeight: 1.55 }}>
						Состояния, которые герои накладывают в бою. На поле они отмечены иконками на юните —
						здесь полный список с пояснениями.
					</Text>
					<div className={styles.legend}>
						<Text size="sm" fw={600}>
							Обозначения
						</Text>
						<ul className={styles.legendList}>
							<li>
								<Text size="sm" c="var(--app-text-muted)" component="span">
									<span className={styles.legendKey}>L</span> — уровень героя в формулах. В
									примерах тултипа для зависящих от L эффектов подставляется {CODEX_L}; в бою
									используется живой уровень юнита.
								</Text>
							</li>
							<li>
								<Text size="sm" c="var(--app-text-muted)" component="span">
									<span className={styles.legendKey}>р.</span> — длительность в раундах
								</Text>
							</li>
							<li>
								<Text size="sm" c="var(--app-text-muted)" component="span">
									<span className={styles.legendKey}>⌊…⌋</span> — целая часть (округление вниз)
								</Text>
							</li>
						</ul>
					</div>
				</Stack>
				<Text size="sm" c="var(--app-text-muted)" ff="monospace">
					{shown === total ? `${total} эффектов` : `${shown} из ${total}`}
				</Text>
			</Group>

			<TextInput
				placeholder="Поиск по названию, описанию, id…"
				value={query}
				onChange={(event) => setQuery(event.currentTarget.value)}
				maw={360}
				aria-label="Поиск эффектов"
			/>

			{shown === 0 ? (
				<Text c="var(--app-text-muted)">Ничего не найдено по запросу «{query.trim()}».</Text>
			) : (
				<>
					{filteredBuffs.length > 0 && (
						<EffectSection title="Усиления" effects={filteredBuffs} />
					)}
					{filteredDebuffs.length > 0 && (
						<EffectSection title="Ослабления" effects={filteredDebuffs} />
					)}
				</>
			)}
		</PageFrame>
	);
};

const EffectSection = ({ title, effects }: { title: string; effects: EffectMeta[] }) => (
	<section className={styles.section}>
		<Title order={2} size="h3" mb="sm">
			{title}
		</Title>
		<ul className={styles.list}>
			{effects.map((effect) => {
				const Icon = effect.Icon;
				return (
					<li key={effect.id} className={styles.item} data-kind={effect.kind}>
						<Group gap="sm" align="flex-start" wrap="nowrap">
							<span className={styles.icon} aria-hidden>
								<Icon size={18} strokeWidth={1.75} />
							</span>
							<Stack gap={4} style={{ minWidth: 0 }}>
								<Text fw={600}>{effect.label}</Text>
								<Text size="sm" c="var(--app-text-muted)" style={{ lineHeight: 1.5 }}>
									{effect.description}
								</Text>
								<Tooltip label={effect.exampleAtL} multiline w={260} withArrow>
									<span className={styles.mechanics}>{effect.mechanics}</span>
								</Tooltip>
							</Stack>
						</Group>
					</li>
				);
			})}
		</ul>
	</section>
);
