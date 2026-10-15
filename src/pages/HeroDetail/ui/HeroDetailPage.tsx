import { Badge, Box, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { useUnit } from 'effector-react';
import { useEffect } from 'react';

import { $hero, $heroError, $heroPending, HeroImage, heroPageOpened } from '@/entities/hero';
import { PageFrame } from '@/shared/ui/PageFrame';

const statRows: ReadonlyArray<{ key: keyof StatSource; label: string }> = [
	{ key: 'health', label: 'Здоровье' },
	{ key: 'damage', label: 'Урон' },
	{ key: 'armor', label: 'Броня' },
	{ key: 'initiative', label: 'Инициатива' },
	{ key: 'dodge', label: 'Уклонение' },
	{ key: 'luck', label: 'Удача' },
	{ key: 'morale', label: 'Мораль' },
	{ key: 'mana', label: 'Мана' },
	{ key: 'power', label: 'Сила магии' },
	{ key: 'accuracy', label: 'Точность' },
	{ key: 'gold', label: 'Золото' },
];

type StatSource = {
	health: number;
	damage: number;
	armor: number;
	initiative: number;
	dodge: number;
	luck: number;
	morale: number;
	mana: number;
	power: number;
	accuracy: number;
	gold: number;
};

export const HeroDetailPage = () => {
	const { code } = useParams({ from: '/heroes/$code' });
	const { hero, error, isPending } = useUnit({
		hero: $hero,
		error: $heroError,
		isPending: $heroPending,
	});

	useEffect(() => {
		heroPageOpened(code);
	}, [code]);

	return (
		<PageFrame width="wide">
			<Text component={Link} to="/heroes" c="brand" td="none" size="sm" fw={500}>
				← К реестру
			</Text>
			{isPending && (
				<Group gap="sm">
					<Loader color="brand" size="sm" />
					<Text size="sm" c="var(--app-text-muted)">
						Загрузка характеристик…
					</Text>
				</Group>
			)}
			{error && (
				<Text c="red" role="alert">
					{error}. Вернитесь в реестр и выберите другого героя.
				</Text>
			)}
			{hero && !isPending && (
				<Group
					align="stretch"
					gap={{ base: 'lg', md: 40 }}
					wrap="wrap"
					preventGrowOverflow={false}
					w="100%"
				>
					<Box
						w={{ base: '100%', sm: 280, md: 320 }}
						maw={350}
						style={{ flexShrink: 0, aspectRatio: '7 / 9' }}
					>
						<HeroImage
							code={hero.code}
							alt={hero.displayName}
							variant="character"
							w="100%"
							h="100%"
							radius={0}
							bg="transparent"
						/>
					</Box>
					<Stack gap="lg" style={{ flex: '1 1 360px', minWidth: 0 }}>
						<Stack gap={10}>
							<Group gap="sm" align="center">
								<Title order={1}>{hero.displayName}</Title>
								{hero.isPlayable ? (
									<Badge color="accent" variant="light" radius={0} tt="none">
										Можно выбрать
									</Badge>
								) : (
									<Badge color="gray" variant="outline" radius={0} tt="none">
										Только призыв
									</Badge>
								)}
							</Group>
							<Text
								ff="monospace"
								size="sm"
								c="var(--app-text-muted)"
								style={{ letterSpacing: '0.04em' }}
							>
								{hero.code}
							</Text>
							<Text size="sm" c="var(--app-text-muted)">
								{hero.isPlayable
									? 'Доступен при формировании отряда'
									: 'Появляется только как призванное существо'}
							</Text>
							{hero.description ? (
								<Text size="md" maw="42rem" style={{ lineHeight: 1.55 }}>
									{hero.description}
								</Text>
							) : null}
							{hero.roleSummary ? (
								<Text size="sm" c="var(--app-text-muted)" maw="42rem" style={{ lineHeight: 1.5 }}>
									{hero.roleSummary}
								</Text>
							) : null}
						</Stack>
						<SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="xs">
							{statRows.map((stat) => (
								<StatCell key={stat.key} label={stat.label} value={hero[stat.key]} />
							))}
						</SimpleGrid>
					</Stack>
				</Group>
			)}
		</PageFrame>
	);
};

const StatCell = ({ label, value }: { label: string; value: number }) => (
	<Box className="sylvenarr-stat-cell">
		<Text className="sylvenarr-stat-cell__label">{label}</Text>
		<Text className="sylvenarr-stat-cell__value" style={{ fontVariantNumeric: 'tabular-nums' }}>
			{value}
		</Text>
	</Box>
);
