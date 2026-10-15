import { Table, UnstyledButton } from '@mantine/core';
import { useTable } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import type { HeroClass } from '@/entities/hero';

import { heroesColumns } from '../model/columns';
import { heroesTableFeatures } from '../model/table-features';

type HeroesTableProps = {
	data: HeroClass[];
};

/**
 * Реестр героев на TanStack Table + Mantine.
 */
export const HeroesTable = ({ data }: HeroesTableProps) => {
	const table = useTable({
		features: heroesTableFeatures,
		columns: heroesColumns,
		data,
		getRowId: (row) => row.code,
	});

	return (
		<Table
			className="sylvenarr-registry-table"
			highlightOnHover
			horizontalSpacing="md"
			verticalSpacing="sm"
			ff="var(--mantine-font-family-monospace)"
			style={{
				borderColor: 'var(--app-border)',
				borderCollapse: 'collapse',
				width: '100%',
				minWidth: 720,
			}}
		>
			<Table.Thead>
				{table.getHeaderGroups().map((headerGroup) => (
					<Table.Tr
						key={headerGroup.id}
						style={{
							borderBottom: '1px solid var(--app-border)',
							background: 'var(--app-surface)',
						}}
					>
						{headerGroup.headers.map((header) => {
							const canSort = header.column.getCanSort();
							const sorted = header.column.getIsSorted();
							return (
								<Table.Th key={header.id} style={{ whiteSpace: 'nowrap' }}>
									{header.isPlaceholder ? null : canSort ? (
										<UnstyledButton
											onClick={header.column.getToggleSortingHandler()}
											style={{
												display: 'inline-flex',
												alignItems: 'center',
												gap: 6,
												color: 'var(--app-text)',
												fontWeight: 600,
											}}
										>
											{table.FlexRender({ header })}
											{sorted === 'asc' ? (
												<ArrowUp size={14} aria-hidden />
											) : sorted === 'desc' ? (
												<ArrowDown size={14} aria-hidden />
											) : (
												<ArrowUpDown size={14} aria-hidden style={{ opacity: 0.45 }} />
											)}
										</UnstyledButton>
									) : (
										table.FlexRender({ header })
									)}
								</Table.Th>
							);
						})}
					</Table.Tr>
				))}
			</Table.Thead>
			<Table.Tbody>
				{table.getRowModel().rows.map((row) => (
					<Table.Tr key={row.id} style={{ borderBottom: '1px solid var(--app-border)' }}>
						{row.getAllCells().map((cell) => (
							<Table.Td
								key={cell.id}
								style={{
									fontVariantNumeric: 'tabular-nums',
									color: cell.column.id === 'displayName' ? undefined : 'var(--app-text-muted)',
								}}
							>
								{table.FlexRender({ cell })}
							</Table.Td>
						))}
					</Table.Tr>
				))}
			</Table.Tbody>
		</Table>
	);
};
