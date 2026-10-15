import { Anchor, Group } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';

import { type HeroClass, HeroImage } from '@/entities/hero';

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
				<Group gap="sm" wrap="nowrap">
					<HeroImage code={hero.code} alt={hero.displayName} variant="portrait" w={40} h={40} />
					<Anchor component={Link} to={`/heroes/${hero.code}`} c="brand" fw={600}>
						{info.getValue()}
					</Anchor>
				</Group>
			);
		},
	}),
	columnHelper.accessor('health', {
		header: 'Здоровье',
		sortFn: 'basic',
	}),
	columnHelper.accessor('damage', {
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
