import { Badge, Box, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';

import type { HeroClass } from '../model/types';
import { HeroImage } from './HeroImage';

type NumericStatKey =
	| 'health'
	| 'damage'
	| 'armor'
	| 'initiative'
	| 'dodge'
	| 'luck'
	| 'morale'
	| 'mana'
	| 'power'
	| 'accuracy'
	| 'gold'
	| 'size';

const statRows: ReadonlyArray<{ key: NumericStatKey; label: string }> = [
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
	{ key: 'size', label: 'Слоты' },
];

type HeroBriefContentProps = {
	hero: HeroClass;
};

/**
 * Краткая карточка героя для модалки draft.
 */
export const HeroBriefContent = ({ hero }: HeroBriefContentProps) => (
	<Group align="stretch" gap="lg" wrap="wrap" preventGrowOverflow={false} w="100%">
		<Box w={{ base: '100%', sm: 200 }} maw={220} style={{ flexShrink: 0, aspectRatio: '7 / 9' }}>
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
		<Stack gap="md" style={{ flex: '1 1 280px', minWidth: 0 }}>
			<Stack gap={8}>
				<Group gap="sm" align="center">
					<Title order={2}>{hero.displayName}</Title>
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
				{hero.description ? (
					<Text size="sm" style={{ lineHeight: 1.55 }}>
						{hero.description}
					</Text>
				) : null}
				{hero.roleSummary ? (
					<Text size="sm" c="var(--app-text-muted)" style={{ lineHeight: 1.5 }}>
						{hero.roleSummary}
					</Text>
				) : null}
			</Stack>
			<SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
				{statRows.map((stat) => (
					<Box key={stat.key} className="sylvenarr-stat-cell">
						<Text className="sylvenarr-stat-cell__label">{stat.label}</Text>
						<Text
							className="sylvenarr-stat-cell__value"
							style={{ fontVariantNumeric: 'tabular-nums' }}
						>
							{hero[stat.key]}
						</Text>
					</Box>
				))}
			</SimpleGrid>
		</Stack>
	</Group>
);
