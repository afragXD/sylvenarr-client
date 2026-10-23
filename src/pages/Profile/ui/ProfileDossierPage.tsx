import { Anchor, Group, Loader, Stack, Text } from '@mantine/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { HeroImage } from '@/entities/hero';
import {
	type FavoriteHero,
	fetchCurrentPlayer,
	fetchMyFavoriteHeroes,
} from '@/entities/player';
import { ApiError } from '@/shared/api/http';
import { PageFrame } from '@/shared/ui/PageFrame';

import { ProfileNav } from './ProfileNav';

/**
 * Досье: личный топ героев по числу выборов в драфте.
 */
export const ProfileDossierPage = () => {
	const navigate = useNavigate();
	const [heroes, setHeroes] = useState<FavoriteHero[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		void fetchCurrentPlayer()
			.then(() => fetchMyFavoriteHeroes(5))
			.then((items) => {
				if (mounted) {
					setHeroes(items);
					setError(null);
				}
			})
			.catch((err) => {
				if (!mounted) {
					return;
				}
				if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
					void navigate({ to: '/sign-in' });
					return;
				}
				setError(err instanceof Error ? err.message : 'Не удалось загрузить');
				setHeroes([]);
			});
		return () => {
			mounted = false;
		};
	}, [navigate]);

	return (
		<PageFrame
			title="Досье"
			eyebrow="Аккаунт"
			width="form"
			lead="Герои, которых вы берёте чаще всего"
		>
			<Stack gap="md">
				<ProfileNav />
				{heroes === null && (
					<Group gap="sm">
						<Loader color="brand" size="sm" />
						<Text size="sm" c="var(--app-text-muted)">
							Загрузка…
						</Text>
					</Group>
				)}
				{error ? (
					<Text c="accent" role="alert">
						{error}
					</Text>
				) : null}
				{heroes !== null && heroes.length === 0 && !error ? (
					<Text c="var(--app-text-muted)">
						Сыграйте матч до конца — здесь появятся герои из ваших составов.
					</Text>
				) : null}
				{heroes !== null && heroes.length > 0 ? (
					<Stack gap="sm">
						{heroes.map((hero) => (
							<Group key={hero.code} gap="sm" wrap="nowrap" justify="space-between">
								<Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
									<HeroImage
										code={hero.code}
										alt={hero.displayName}
										variant="portrait"
										w={40}
										h={40}
									/>
									<Anchor
										component={Link}
										to={`/heroes/${hero.code}`}
										c="var(--app-text)"
										underline="never"
										truncate
									>
										{hero.displayName}
									</Anchor>
								</Group>
								<Text
									ff="monospace"
									c="var(--app-text-muted)"
									style={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}
								>
									{hero.pickCount}
								</Text>
							</Group>
						))}
					</Stack>
				) : null}
			</Stack>
		</PageFrame>
	);
};
