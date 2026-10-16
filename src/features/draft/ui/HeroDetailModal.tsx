import { Loader, Modal, Text } from '@mantine/core';
import { useEffect, useState } from 'react';

import { fetchHeroByCode, HeroBriefContent, type HeroClass } from '@/entities/hero';
import { ApiError } from '@/shared/api/http';

type HeroDetailModalProps = {
	code: string | null;
	onClose: () => void;
};

/**
 * Модалка карточки героя поверх draft.
 */
export const HeroDetailModal = ({ code, onClose }: HeroDetailModalProps) => {
	const [hero, setHero] = useState<HeroClass | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	useEffect(() => {
		if (!code) {
			setHero(null);
			setError(null);
			return;
		}
		let mounted = true;
		setPending(true);
		setError(null);
		void fetchHeroByCode(code)
			.then((loaded) => {
				if (mounted) {
					setHero(loaded);
				}
			})
			.catch((err: unknown) => {
				if (mounted) {
					setError(err instanceof ApiError ? err.message : 'Не удалось загрузить героя');
					setHero(null);
				}
			})
			.finally(() => {
				if (mounted) {
					setPending(false);
				}
			});
		return () => {
			mounted = false;
		};
	}, [code]);

	return (
		<Modal
			opened={Boolean(code)}
			onClose={onClose}
			title={hero?.displayName ?? 'Герой'}
			size="xl"
			centered
			radius={0}
		>
			{pending && <Loader color="brand" size="sm" />}
			{error && (
				<Text c="red" role="alert">
					{error}
				</Text>
			)}
			{hero && !pending ? <HeroBriefContent hero={hero} /> : null}
		</Modal>
	);
};
