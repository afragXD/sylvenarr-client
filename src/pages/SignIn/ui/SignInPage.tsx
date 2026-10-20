import { Alert, Box, Group, Stack, Text } from '@mantine/core';
import { Link, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { type AuthProvider, fetchAuthProviders, fetchCurrentPlayer } from '@/entities/player';
import { OAuthProviderButton } from '@/shared/ui/oauth';
import { PageFrame } from '@/shared/ui/PageFrame';

/**
 * Вход только через OAuth-провайдеров.
 */
export const SignInPage = () => {
	const search = useSearch({ from: '/sign-in' });
	const authError = search.auth === 'error';
	const [providers, setProviders] = useState<AuthProvider[]>([]);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [alreadySignedIn, setAlreadySignedIn] = useState(false);

	useEffect(() => {
		let mounted = true;
		void fetchAuthProviders()
			.then((items) => {
				if (mounted) {
					setProviders(items);
				}
			})
			.catch((err: unknown) => {
				if (mounted) {
					setLoadError(err instanceof Error ? err.message : 'Не удалось загрузить вход');
				}
			});
		void fetchCurrentPlayer()
			.then(() => {
				if (mounted) {
					setAlreadySignedIn(true);
				}
			})
			.catch(() => {
				if (mounted) {
					setAlreadySignedIn(false);
				}
			});
		return () => {
			mounted = false;
		};
	}, []);

	return (
		<PageFrame
			width="form"
			eyebrow="Арена"
			title="Войти"
			lead="Вход только через Яндекс. Рейтинг и история матчей закрепляются за вами."
			scene="/scenes/battle.png"
		>
			<Box className="sylvenarr-panel">
				<Stack gap="md">
					{authError && (
						<Alert color="red" title="Не удалось войти" role="alert">
							Попробуйте ещё раз. Если ошибка повторяется — проверьте настройки OAuth.
						</Alert>
					)}
					{alreadySignedIn && (
						<Alert color="brand" title="Вы уже вошли">
							Можно перейти в{' '}
							<Text component={Link} to="/lobby" c="brand" span fw={600} td="underline">
								лобби
							</Text>
							.
						</Alert>
					)}
					{loadError && (
						<Text c="red" role="alert">
							{loadError}
						</Text>
					)}
					{providers.length === 0 && !loadError ? (
						<Text size="sm" c="var(--app-text-muted)">
							Способы входа пока не настроены на сервере.
						</Text>
					) : (
						<Group gap="md" justify="center" mt="xs">
							{providers.map((provider) => (
								<OAuthProviderButton
									key={provider.id}
									providerId={provider.id}
									label={provider.label}
								/>
							))}
						</Group>
					)}
				</Stack>
			</Box>
		</PageFrame>
	);
};
