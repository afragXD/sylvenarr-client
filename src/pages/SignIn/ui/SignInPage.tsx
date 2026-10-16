import { Alert, Box, Button, Stack, Text, Title } from '@mantine/core';
import { Link, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import {
	type AuthProvider,
	fetchAuthProviders,
	fetchCurrentPlayer,
	getOAuthStartUrl,
} from '@/entities/player';
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
		<PageFrame width="form">
			<Box className="sylvenarr-panel">
				<Stack gap={6}>
					<Title order={1}>Войти</Title>
					<Text c="var(--app-text-muted)">
						Вход в Sylvenarr только через OAuth. Создавать матчи и заходить в лобби могут
						авторизованные игроки.
					</Text>
				</Stack>
				<Stack gap="md" mt="lg">
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
						providers.map((provider) => (
							<Button
								key={provider.id}
								className="sylvenarr-plate-btn"
								color="brand"
								component="a"
								href={getOAuthStartUrl(provider.id)}
							>
								Войти через {provider.label}
							</Button>
						))
					)}
				</Stack>
			</Box>
		</PageFrame>
	);
};
