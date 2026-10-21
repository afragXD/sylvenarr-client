import { Anchor, Group, Stack, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';

import { displayAttack, type HeroClass, HeroImage } from '@/entities/hero';

import type { heroesTableFeatures } from './table-features';

const columnHelper = createColumnHelper<typeof heroesTableFeatures, HeroClass>();

/**
 * Колонки реестра героев.
 */
export const heroesColumns = columnHelper.columns([
	columnHelper.accessor('displayName', {
		id: 'displayName',
		header: 'Герой',
		sortFn: 'alphanumeric',
		cell: (info) => {
			const hero = info.row.original;
			return (
				<Group gap="sm" wrap="nowrap" align="flex-start">
					<HeroImage code={hero.code} alt={hero.displayName} variant="portrait" w={40} h={40} />
					<Stack gap={2} style={{ minWidth: 0 }}>
						<Anchor component={Link} to={`/heroes/${hero.code}`} c="brand" fw={600}>
							{info.getValue()}
						</Anchor>
						{hero.roleSummary ? (
							<Text
								size="xs"
								c="var(--app-text-muted)"
								lineClamp={2}
								style={{ lineHeight: 1.35 }}
							>
								{hero.roleSummary}
							</Text>
						) : null}
					</Stack>
				</Group>
			);
		},
	}),
	columnHelper.accessor('size', {
		id: 'size',
		header: 'Клетки',
		sortFn: 'basic',
		cell: (info) => {
			const size = info.getValue();
			return size > 1 ? 'II' : 'I';
		},
	}),
	columnHelper.accessor('health', {
		header: 'Здоровье',
		sortFn: 'basic',
	}),
	columnHelper.accessor((row) => displayAttack(row.damage, row.power), {
		id: 'damage',
		header: 'Урон',
		sortFn: 'basic',
	}),
	columnHelper.accessor('armor', {
		header: 'Броня',
		sortFn: 'basic',
	}),
	columnHelper.accessor('initiative', {
		header: 'Инициатива',
		sortFn: 'basic',
	}),
	columnHelper.accessor('accuracy', {
		header: 'Точность',
		sortFn: 'basic',
	}),
	columnHelper.accessor('gold', {
		header: 'Золото',
		sortFn: 'basic',
	}),
]);
