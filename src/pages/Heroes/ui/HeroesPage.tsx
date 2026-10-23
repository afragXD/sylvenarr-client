import { Anchor, Box, Group, Loader, Stack, Text, TextInput } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { useUnit } from 'effector-react';
import { useEffect, useMemo, useState } from 'react';

import {
	$heroes,
	$heroesError,
	$heroesPending,
	$heroesReady,
	heroesPageMounted,
} from '@/entities/hero';
import { HeroesTable } from '@/features/HeroesTable';
import { PageFrame } from '@/shared/ui/PageFrame';

export const HeroesPage = () => {
	const { heroes, error, isPending, isReady } = useUnit({
		heroes: $heroes,
		error: $heroesError,
		isPending: $heroesPending,
		isReady: $heroesReady,
	});
	const [query, setQuery] = useState('');
	const filtered = useMemo(() => {
		const q = query.trim().toLocaleLowerCase('ru');
		if (!q) {
			return heroes;
		}
		return heroes.filter((hero) => {
			const hay = [hero.displayName, hero.code, hero.roleSummary ?? '', hero.description ?? '']
				.join(' ')
				.toLocaleLowerCase('ru');
			return hay.includes(q);
		});
	}, [heroes, query]);

	const showLoader = heroes.length === 0 && (isPending || !isReady);
	const showEmpty = isReady && !isPending && !error && heroes.length === 0;
	const showTable = heroes.length > 0;

	useEffect(() => {
		heroesPageMounted();
	}, []);

	return (
		<PageFrame
			width="wide"
			eyebrow="Каталог"
			title="Реестр героев"
			lead="Двадцать четыре класса: статы, роли и кого брать в отряд."
		>
			<Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
				<Stack gap={6} maw={640}>
					<Group gap="md">
						<Anchor component={Link} to="/heroes/popular" size="sm" c="brand" w="fit-content">
							Популярные герои
						</Anchor>
						<Anchor component={Link} to="/heroes/effects" size="sm" c="brand" w="fit-content">
							Кодекс эффектов
						</Anchor>
					</Group>
				</Stack>
				{showTable && (
					<Text size="sm" c="brand" className="sylvenarr-tabular">
						{filtered.length === heroes.length
							? `${heroes.length} классов в каталоге`
							: `${filtered.length} из ${heroes.length}`}
					</Text>
				)}
			</Group>
			{showTable && (
				<TextInput
					placeholder="Поиск по имени, коду, описанию…"
					value={query}
					onChange={(event) => setQuery(event.currentTarget.value)}
					maw={360}
					aria-label="Поиск героев"
				/>
			)}
			{showLoader && (
				<Group gap="sm">
					<Loader color="brand" size="sm" />
					<Text size="sm" c="var(--app-text-muted)">
						Загрузка реестра…
					</Text>
				</Group>
			)}
			{error && (
				<Text c="red" role="alert">
					{error}. Проверьте API и обновите страницу.
				</Text>
			)}
			{showEmpty && (
				<Text c="var(--app-text-muted)">
					В каталоге пока нет классов — запустите seed на сервисе.
				</Text>
			)}
			{showTable && filtered.length === 0 && (
				<Text c="var(--app-text-muted)">Ничего не найдено по запросу «{query.trim()}».</Text>
			)}
			{showTable && filtered.length > 0 && (
				<Box style={{ overflowX: 'auto' }}>
					<HeroesTable data={filtered} />
				</Box>
			)}
		</PageFrame>
	);
};
