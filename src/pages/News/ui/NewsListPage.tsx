import { Stack, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { fetchNewsList, NEWS_CATEGORY_LABEL, type NewsSummary } from '@/entities/news';
import { OrnateButton } from '@/shared/ui/OrnateButton';
import { OrnateFrame } from '@/shared/ui/OrnateFrame';
import { PageFrame } from '@/shared/ui/PageFrame';

const formatDate = (iso: string | null): string => {
	if (!iso) {
		return '';
	}
	return new Intl.DateTimeFormat('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(new Date(iso));
};

export const NewsListPage = () => {
	const [items, setItems] = useState<NewsSummary[]>([]);
	const [cursor, setCursor] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = async (next?: string | null, append = false) => {
		setLoading(true);
		setError(null);
		try {
			const result = await fetchNewsList({ limit: 9, cursor: next });
			setItems((prev) => (append ? [...prev, ...result.items] : result.items));
			setCursor(result.nextCursor);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Не удалось загрузить новости');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void load();
	}, []);

	const [feature, ...rest] = items;

	return (
		<PageFrame
			title="Новости"
			eyebrow="Хроника"
			lead="Обновления арены, девлоги и анонсы — всё, что меняет игру."
			scene="/scenes/hero.png"
			width="content"
		>
			{error ? <Text c="accent">{error}</Text> : null}
			{feature ? (
				<OrnateFrame variant="panel">
					<Stack gap="sm">
						<Text size="sm" c="var(--copper)" tt="uppercase" style={{ letterSpacing: '0.08em' }}>
							{NEWS_CATEGORY_LABEL[feature.category]}
							{feature.publishedAt ? ` — ${formatDate(feature.publishedAt)}` : ''}
						</Text>
						<Text
							component={Link}
							to={`/news/${feature.slug}`}
							ff="headings"
							fw={700}
							size="xl"
							c="var(--app-text)"
							td="none"
							tt="uppercase"
							style={{ letterSpacing: '0.04em' }}
						>
							{feature.title}
						</Text>
						<Text c="var(--app-text-muted)" maw="48ch" style={{ lineHeight: 1.55 }}>
							{feature.summary}
						</Text>
					</Stack>
				</OrnateFrame>
			) : null}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
					gap: '1rem',
				}}
			>
				{rest.map((item) => (
					<Link
						key={item.id}
						to={`/news/${item.slug}`}
						style={{ textDecoration: 'none', color: 'inherit' }}
					>
						<OrnateFrame variant="card">
							<Text size="xs" c="var(--copper)" tt="uppercase" style={{ letterSpacing: '0.08em' }}>
								{NEWS_CATEGORY_LABEL[item.category]}
								{item.publishedAt ? ` — ${formatDate(item.publishedAt)}` : ''}
							</Text>
							<Text ff="headings" fw={700} tt="uppercase" style={{ letterSpacing: '0.04em' }}>
								{item.title}
							</Text>
							<Text size="sm" c="var(--app-text-muted)" style={{ lineHeight: 1.45 }}>
								{item.summary}
							</Text>
						</OrnateFrame>
					</Link>
				))}
			</div>
			{cursor ? (
				<OrnateButton variant="outline" disabled={loading} onClick={() => void load(cursor, true)}>
					Показать ещё
				</OrnateButton>
			) : null}
			{!loading && items.length === 0 && !error ? (
				<Text c="var(--app-text-muted)">Пока нет опубликованных новостей.</Text>
			) : null}
		</PageFrame>
	);
};
