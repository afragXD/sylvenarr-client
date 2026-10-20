import { Anchor, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import {
	fetchHeroByCode,
	getSummonerSummons,
	type HeroClass,
	HeroImage,
	isTransformForm,
	type SummonRef,
} from '@/entities/hero';

import styles from './HeroAbilitiesSection.module.css';

type HeroSummonsSectionProps = {
	summonerCode: string;
};

type LoadedEntry = {
	ref: SummonRef;
	hero: HeroClass | null;
	error: string | null;
};

/**
 * Блок «Призывы» на карточке призывателя: превью и ссылки на /heroes/{code}.
 */
export const HeroSummonsSection = ({ summonerCode }: HeroSummonsSectionProps) => {
	const config = getSummonerSummons(summonerCode);
	const [entries, setEntries] = useState<LoadedEntry[] | null>(null);

	useEffect(() => {
		const summons = getSummonerSummons(summonerCode);
		if (!summons) {
			setEntries(null);
			return;
		}
		let cancelled = false;
		setEntries(null);

		void Promise.all(
			summons.entries.map(async (ref) => {
				try {
					const hero = await fetchHeroByCode(ref.code);
					return { ref, hero, error: null } satisfies LoadedEntry;
				} catch {
					return {
						ref,
						hero: null,
						error: 'Не удалось загрузить',
					} satisfies LoadedEntry;
				}
			}),
		).then((loaded) => {
			if (!cancelled) {
				setEntries(loaded);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [summonerCode]);

	if (!config) {
		return null;
	}

	const formsOnly = config.entries.every((entry) => isTransformForm(entry.code));
	const sectionTitle = formsOnly ? 'Боевые формы' : 'Призывы';
	const loadingLabel = formsOnly ? 'Загрузка форм…' : 'Загрузка призывов…';

	return (
		<Stack gap="md" className={styles.section} maw="42rem">
			<Title order={2} size="h3">
				{sectionTitle}
			</Title>

			{entries === null && (
				<Group gap="sm">
					<Loader color="brand" size="sm" />
					<Text size="sm" c="var(--app-text-muted)">
						{loadingLabel}
					</Text>
				</Group>
			)}

			{entries?.map(({ ref, hero, error }) => (
				<div key={ref.code} className={styles.entry}>
					<Group gap="sm" wrap="nowrap" align="flex-start">
						<HeroImage
							code={ref.code}
							alt={hero?.displayName ?? ref.code}
							variant="portrait"
							w={48}
							h={48}
							radius={0}
						/>
						<Stack gap={4} style={{ minWidth: 0 }}>
							<Group gap={8} wrap="wrap">
								<Anchor component={Link} to={`/heroes/${ref.code}`} c="brand" fw={600} size="sm">
									{hero?.displayName ?? ref.code}
								</Anchor>
								{ref.note && (
									<Text size="xs" c="var(--app-text-muted)">
										{ref.note}
									</Text>
								)}
							</Group>
							{error && (
								<Text size="sm" c="red">
									{error}
								</Text>
							)}
							{hero && (
								<Text size="sm" c="var(--app-text-muted)" style={{ lineHeight: 1.5 }}>
									{hero.roleSummary || hero.description || 'Описание скоро появится.'}
								</Text>
							)}
						</Stack>
					</Group>
				</div>
			))}

			{config.footnote && (
				<Text size="sm" c="var(--app-text-muted)" style={{ lineHeight: 1.5 }}>
					{config.footnote}
				</Text>
			)}
		</Stack>
	);
};
