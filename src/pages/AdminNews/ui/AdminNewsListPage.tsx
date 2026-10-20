import { Button, Group, Stack, Table, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import {
	deleteNews,
	fetchAdminNewsList,
	NEWS_CATEGORY_LABEL,
	type NewsItem,
} from '@/entities/news';
import { OrnateLink } from '@/shared/ui/OrnateButton';
import { PageFrame } from '@/shared/ui/PageFrame';

const statusOf = (item: NewsItem): string => {
	if (!item.publishedAt) {
		return 'Черновик';
	}
	if (new Date(item.publishedAt).getTime() > Date.now()) {
		return 'Запланирована';
	}
	return 'Опубликована';
};

export const AdminNewsListPage = () => {
	const [items, setItems] = useState<NewsItem[]>([]);
	const [error, setError] = useState<string | null>(null);

	const reload = () => {
		void fetchAdminNewsList()
			.then(setItems)
			.catch((err: unknown) => {
				setError(err instanceof Error ? err.message : 'Ошибка загрузки');
			});
	};

	useEffect(() => {
		reload();
	}, []);

	const handleDelete = async (id: string, title: string) => {
		if (!window.confirm(`Удалить «${title}»?`)) {
			return;
		}
		try {
			await deleteNews(id);
			reload();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Не удалось удалить');
		}
	};

	return (
		<PageFrame
			title="Новости"
			eyebrow="Админка"
			lead="Черновики, публикации и правки хроники разработки."
			width="wide"
		>
			<Group justify="space-between">
				<OrnateLink to="/admin/news/new" variant="parchment" withDiamonds={false} size="sm">
					Новая новость
				</OrnateLink>
			</Group>
			{error ? <Text c="accent">{error}</Text> : null}
			<div className="sylvenarr-panel">
				<Table className="sylvenarr-registry-table" highlightOnHover>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Заголовок</Table.Th>
							<Table.Th>Категория</Table.Th>
							<Table.Th>Статус</Table.Th>
							<Table.Th />
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{items.map((item) => (
							<Table.Tr key={item.id}>
								<Table.Td>
									<Stack gap={2}>
										<Text fw={600}>{item.title}</Text>
										<Text size="xs" c="var(--app-text-muted)">
											/{item.slug}
										</Text>
									</Stack>
								</Table.Td>
								<Table.Td>{NEWS_CATEGORY_LABEL[item.category]}</Table.Td>
								<Table.Td>{statusOf(item)}</Table.Td>
								<Table.Td>
									<Group gap="xs" justify="flex-end">
										<Button
											component={Link}
											to={`/admin/news/${item.id}`}
											size="compact-sm"
											variant="default"
											radius={0}
										>
											Править
										</Button>
										<Button
											size="compact-sm"
											variant="subtle"
											color="red"
											radius={0}
											onClick={() => void handleDelete(item.id, item.title)}
										>
											Удалить
										</Button>
									</Group>
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</div>
		</PageFrame>
	);
};
