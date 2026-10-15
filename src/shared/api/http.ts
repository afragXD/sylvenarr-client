import { API_BASE_URL } from '@/shared/constants';

export class ApiError extends Error {
	readonly status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

const readErrorMessage = async (response: Response, fallback: string): Promise<string> => {
	try {
		const data: unknown = await response.json();
		if (
			typeof data === 'object' &&
			data !== null &&
			'message' in data &&
			typeof (data as { message: unknown }).message === 'string'
		) {
			return (data as { message: string }).message;
		}
	} catch {
		// ignore JSON parse errors
	}
	return fallback;
};

/**
 * Fetch к API сервиса с credentials (cookies).
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	const headers = new Headers(init?.headers);
	if (init?.body && !headers.has('content-type')) {
		headers.set('content-type', 'application/json');
	}
	const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
		...init,
		credentials: 'include',
		headers,
	});
	return response;
}

/**
 * apiFetch + проверка ok; при ошибке бросает ApiError с message с сервера.
 */
export async function apiFetchJson<T>(
	path: string,
	init: RequestInit | undefined,
	parse: (data: unknown) => T,
	fallbackError: string,
): Promise<T> {
	const response = await apiFetch(path, init);
	if (!response.ok) {
		const message = await readErrorMessage(response, fallbackError);
		throw new ApiError(message, response.status);
	}
	const data: unknown = await response.json();
	return parse(data);
}
