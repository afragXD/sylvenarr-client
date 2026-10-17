import { Anchor, Box, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { useUnit } from 'effector-react';
import { useEffect } from 'react';

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
	const showLoader = heroes.length === 0 && (isPending || !isReady);
	const showEmpty = isReady && !isPending && !error && heroes.length === 0;
	const showTable = heroes.length > 0;

	useEffect(() => {
		heroesPageMounted();
	}, []);

	return (
		<PageFrame width="wide">
			<Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
				<Stack gap={6} maw={640}>
					<Title order={1}>Реестр героев</Title>
					<Text c="var(--app-text-muted)">
						Двадцать четыре класса Sylvenarr: Origins. Сортируйте по статам и откройте карточку
						перед набором отряда.
					</Text>
					<Anchor component={Link} to="/heroes/effects" size="sm" c="brand" w="fit-content">
						Кодекс эффектов
					</Anchor>
				</Stack>
				{showTable && (
					<Text size="sm" c="brand" ff="monospace">
						{heroes.length} классов в каталоге
					</Text>
				)}
			</Group>
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
			{showTable && (
				<Box style={{ overflowX: 'auto' }}>
					<HeroesTable data={heroes} />
				</Box>
			)}
		</PageFrame>
	);
};
