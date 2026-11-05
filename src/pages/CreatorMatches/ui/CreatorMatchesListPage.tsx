import { Button, Group, Stack, Table, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { type CreatorMatchListItem, fetchCreatorMatches } from '@/entities/creatorMatch';
import { PageFrame } from '@/shared/ui/PageFrame';

export const CreatorMatchesListPage = () => {
	const [items, setItems] = useState<CreatorMatchListItem[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	const reload = () => {
		setLoading(true);
		setError(null);
		void fetchCreatorMatches()
			.then(setItems)
			.catch((err: unknown) => {
				setError(err instanceof Error ? err.message : 'Ошибка загрузки');
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		reload();
	}, []);

	return (
		<PageFrame
			title="Живые матчи"
			eyebrow="Креатор"
			lead="Fighting-матчи: правка статов юнитов в текущем BattleState."
			width="wide"
		>
			<Group justify="flex-end">
				<Button variant="default" size="compact-sm" onClick={reload} loading={loading}>
					Обновить
				</Button>
			</Group>
			{error ? (
				<Text c="red" size="sm">
					{error}
				</Text>
			) : null}
			{!loading && items.length === 0 ? (
				<Text c="dimmed" size="sm">
					Сейчас нет матчей в статусе fighting.
				</Text>
			) : null}
			{items.length > 0 ? (
				<Table striped highlightOnHover withTableBorder>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Хост</Table.Th>
							<Table.Th>Гость</Table.Th>
							<Table.Th>Раунд</Table.Th>
							<Table.Th />
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{items.map((item) => (
							<Table.Tr key={item.id}>
								<Table.Td>{item.hostDisplayName}</Table.Td>
								<Table.Td>{item.guestDisplayName ?? '—'}</Table.Td>
								<Table.Td>{item.stage ?? '—'}</Table.Td>
								<Table.Td>
									<Button
										component={Link}
										to="/creator/matches/$id"
										params={{ id: item.id }}
										size="compact-sm"
										variant="light"
									>
										Открыть
									</Button>
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			) : null}
			<Stack gap={4}>
				<Text size="xs" c="dimmed">
					Изменения уходят игрокам по WS после сохранения.
				</Text>
			</Stack>
		</PageFrame>
	);
};
