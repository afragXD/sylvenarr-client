export type NewsCategory = 'announcement' | 'devlog' | 'update' | 'fix';

export type NewsSummary = {
	id: string;
	slug: string;
	title: string;
	summary: string;
	category: NewsCategory;
	coverUrl: string | null;
	publishedAt: string | null;
};

export type NewsItem = NewsSummary & {
	body: string;
	authorId: string | null;
	createdAt: string;
	updatedAt: string;
};

export type NewsListResponse = {
	items: NewsSummary[];
	nextCursor: string | null;
};

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
	announcement: 'Анонс',
	devlog: 'Девлог',
	update: 'Обновление',
	fix: 'Исправление',
};
