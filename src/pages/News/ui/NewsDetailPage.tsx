import { Stack, Text } from '@mantine/core';
import { useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { fetchNewsBySlug, NEWS_CATEGORY_LABEL, type NewsItem } from '@/entities/news';
import { resolveStaticUrl } from '@/shared/lib/staticUrl';
import { ArtFade } from '@/shared/ui/ArtFade';
import { MarkdownBody } from '@/shared/ui/MarkdownBody';
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

export const NewsDetailPage = () => {
	const { slug } = useParams({ from: '/news/$slug' });
	const [item, setItem] = useState<NewsItem | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		void fetchNewsBySlug(slug)
			.then(setItem)
			.catch((err: unknown) => {
				setError(err instanceof Error ? err.message : 'Новость не найдена');
			});
	}, [slug]);

	if (error) {
		return (
			<PageFrame title="Новость" width="wide">
				<Text c="accent">{error}</Text>
			</PageFrame>
		);
	}

	if (!item) {
		return (
			<PageFrame title="Новость" width="wide">
				<Text c="var(--app-text-muted)">Загрузка…</Text>
			</PageFrame>
		);
	}

	return (
		<PageFrame
			title={item.title}
			eyebrow={NEWS_CATEGORY_LABEL[item.category]}
			lead={item.summary}
			width="wide"
		>
			<Stack gap="md">
				<Text size="sm" c="var(--app-text-muted)">
					{formatDate(item.publishedAt)}
				</Text>
				{item.coverUrl ? (
					<ArtFade
						src={resolveStaticUrl(item.coverUrl) ?? item.coverUrl}
						mask="bottom"
						alt=""
						style={{ maxHeight: 380, width: '100%' }}
					/>
				) : null}
				<div style={{ color: 'var(--app-text-muted)', fontSize: '1.05rem' }}>
					<MarkdownBody>{item.body}</MarkdownBody>
				</div>
			</Stack>
		</PageFrame>
	);
};
