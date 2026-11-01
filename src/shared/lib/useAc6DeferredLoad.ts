import { useCallback, useEffect, useState } from 'react';

export type Ac6LoadState = 'loading' | 'ok' | 'error';

type Ac6DeferredLoadResult<T> = {
	state: Ac6LoadState;
	data: T | null;
	retry: () => void;
};

/**
 * AC-6: скелетон сразу; «Не удалось загрузить · Повторить» не раньше 4 с и не позже 6 с.
 * Успех — сразу; сеть зависла — fail на 5 с; быстрый fail — ждём до 4 с.
 */
export function useAc6DeferredLoad<T>(
	load: () => Promise<T>,
	deps: readonly unknown[],
): Ac6DeferredLoadResult<T> {
	const [state, setState] = useState<Ac6LoadState>('loading');
	const [data, setData] = useState<T | null>(null);
	const [retryKey, setRetryKey] = useState(0);

	useEffect(() => {
		let alive = true;
		const started = Date.now();
		setState('loading');
		setData(null);

		const hangTimer = window.setTimeout(() => {
			if (alive) {
				setState((prev) => (prev === 'loading' ? 'error' : prev));
			}
		}, 5000);

		void load()
			.then((value) => {
				if (!alive) {
					return;
				}
				window.clearTimeout(hangTimer);
				setData(value);
				setState('ok');
			})
			.catch(async () => {
				if (!alive) {
					return;
				}
				const wait = Math.max(0, 4000 - (Date.now() - started));
				if (wait > 0) {
					await new Promise((resolve) => {
						window.setTimeout(resolve, wait);
					});
				}
				if (!alive) {
					return;
				}
				window.clearTimeout(hangTimer);
				setState('error');
			});

		return () => {
			alive = false;
			window.clearTimeout(hangTimer);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
	}, [...deps, retryKey]);

	const retry = useCallback(() => {
		setRetryKey((key) => key + 1);
	}, []);

	return { state, data, retry };
}
