export {
	createNews,
	deleteNews,
	fetchAdminNews,
	fetchAdminNewsList,
	fetchNewsBySlug,
	fetchNewsList,
	type NewsWritePayload,
	updateNews,
	uploadNewsImage,
} from './api/newsApi';
export {
	NEWS_CATEGORY_LABEL,
	type NewsCategory,
	type NewsItem,
	type NewsListResponse,
	type NewsSummary,
} from './model/types';
