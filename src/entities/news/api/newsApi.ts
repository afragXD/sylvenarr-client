import { apiFetchJson } from '@/shared/api/http';

import type { NewsCategory, NewsItem, NewsListResponse, NewsSummary } from '../model/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const CATEGORIES: ReadonlySet<string> = new Set(['announcement', 'devlog', 'update', 'fix']);

const parseCategory = (value: unknown): NewsCategory =>
	typeof value === 'string' && CATEGORIES.has(value) ? (value as NewsCategory) : 'devlog';

const parseSummary = (data: unknown): NewsSummary => {
	if (!isRecord(data) || typeof data.id !== 'string' || typeof data.slug !== 'string') {
		throw new Error('Некорректная новость');
	}
	return {
		id: data.id,
		slug: data.slug,
		title: String(data.title ?? ''),
		summary: String(data.summary ?? ''),
		category: parseCategory(data.category),
		coverUrl: typeof data.coverUrl === 'string' ? data.coverUrl : null,
		publishedAt: typeof data.publishedAt === 'string' ? data.publishedAt : null,
	};
};

const parseItem = (data: unknown): NewsItem => {
	const summary = parseSummary(data);
	if (!isRecord(data)) {
		throw new Error('Некорректная новость');
	}
	return {
		...summary,
		body: String(data.body ?? ''),
		authorId: typeof data.authorId === 'string' ? data.authorId : null,
		createdAt: String(data.createdAt ?? ''),
		updatedAt: String(data.updatedAt ?? ''),
	};
};

export async function fetchNewsList(options?: {
	limit?: number;
	cursor?: string | null;
}): Promise<NewsListResponse> {
	const params = new URLSearchParams();
	if (options?.limit) {
		params.set('limit', String(options.limit));
	}
	if (options?.cursor) {
		params.set('cursor', options.cursor);
	}
	const qs = params.toString();
	return apiFetchJson(
		`/news${qs ? `?${qs}` : ''}`,
		undefined,
		(data) => {
			if (!isRecord(data) || !Array.isArray(data.items)) {
				throw new Error('Некорректный список новостей');
			}
			return {
				items: data.items.map(parseSummary),
				nextCursor: typeof data.nextCursor === 'string' ? data.nextCursor : null,
			};
		},
		'Не удалось загрузить новости',
	);
}

export async function fetchNewsBySlug(slug: string): Promise<NewsItem> {
	return apiFetchJson(
		`/news/${encodeURIComponent(slug)}`,
		undefined,
		parseItem,
		'Новость не найдена',
	);
}

export async function fetchAdminNewsList(): Promise<NewsItem[]> {
	return apiFetchJson(
		'/admin/news',
		undefined,
		(data) => {
			if (!Array.isArray(data)) {
				throw new Error('Некорректный список новостей');
			}
			return data.map(parseItem);
		},
		'Не удалось загрузить новости',
	);
}

export async function fetchAdminNews(id: string): Promise<NewsItem> {
	return apiFetchJson(
		`/admin/news/${encodeURIComponent(id)}`,
		undefined,
		parseItem,
		'Новость не найдена',
	);
}

export type NewsWritePayload = {
	slug: string;
	title: string;
	summary: string;
	body: string;
	category?: NewsCategory;
	coverUrl?: string | null;
	publishedAt?: string | null;
};

export async function createNews(payload: NewsWritePayload): Promise<NewsItem> {
	return apiFetchJson(
		'/admin/news',
		{ method: 'POST', body: JSON.stringify(payload) },
		parseItem,
		'Не удалось создать новость',
	);
}

export async function updateNews(
	id: string,
	payload: Partial<NewsWritePayload>,
): Promise<NewsItem> {
	return apiFetchJson(
		`/admin/news/${encodeURIComponent(id)}`,
		{ method: 'PATCH', body: JSON.stringify(payload) },
		parseItem,
		'Не удалось обновить новость',
	);
}

export async function deleteNews(id: string): Promise<void> {
	await apiFetchJson(
		`/admin/news/${encodeURIComponent(id)}`,
		{ method: 'DELETE' },
		() => undefined,
		'Не удалось удалить новость',
	);
}
