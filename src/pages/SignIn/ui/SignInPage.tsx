import { Alert, Box, Button, Divider, Group, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import {
	type AuthProvider,
	fetchAuthProviders,
	fetchCurrentPlayer,
	loginWithPassword,
} from '@/entities/player';
import { ApiError } from '@/shared/api/http';
import { OAuthProviderButton } from '@/shared/ui/oauth';
import { PageFrame } from '@/shared/ui/PageFrame';

import { signInSchema } from '../model/signInSchema';

function fieldErrorMessage(errors: unknown[]): string | undefined {
	const first = errors[0];
	if (!first) {
		return undefined;
	}
	if (typeof first === 'string') {
		return first;
	}
	if (typeof first === 'object' && first !== null && 'message' in first) {
		const message = (first as { message: unknown }).message;
		return typeof message === 'string' ? message : undefined;
	}
	return undefined;
}

/**
 * Вход: логин/почта + пароль или OAuth.
 */
export const SignInPage = () => {
	const search = useSearch({ from: '/sign-in' });
	const navigate = useNavigate();
	const authError = search.auth === 'error';
	const [providers, setProviders] = useState<AuthProvider[]>([]);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [alreadySignedIn, setAlreadySignedIn] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			loginOrEmail: '',
			password: '',
		},
		validators: {
			onChange: signInSchema,
		},
		onSubmit: async ({ value }) => {
			setServerError(null);
			try {
				await loginWithPassword(value);
				await fetchCurrentPlayer();
				await navigate({ to: '/lobby' });
			} catch (err) {
				const message =
					err instanceof ApiError
						? err.message
						: err instanceof Error
							? err.message
							: 'Неверный логин или пароль';
				setServerError(message);
			}
		},
	});

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
			lead="Войдите логином, почтой или через Яндекс. Рейтинг и история матчей закрепляются за вами."
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
					{serverError && (
						<Alert color="red" title="Не удалось войти" role="alert">
							{serverError}
						</Alert>
					)}
					{loadError && (
						<Text c="red" role="alert">
							{loadError}
						</Text>
					)}

					<form
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<Stack gap="sm">
							<form.Field name="loginOrEmail">
								{(field) => {
									const error = field.state.meta.isTouched
										? fieldErrorMessage(field.state.meta.errors)
										: undefined;
									return (
										<TextInput
											id={field.name}
											name={field.name}
											label="Логин или почта"
											autoComplete="username"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => field.handleChange(event.currentTarget.value)}
											error={error}
										/>
									);
								}}
							</form.Field>
							<form.Field name="password">
								{(field) => {
									const error = field.state.meta.isTouched
										? fieldErrorMessage(field.state.meta.errors)
										: undefined;
									return (
										<PasswordInput
											id={field.name}
											name={field.name}
											label="Пароль"
											autoComplete="current-password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => field.handleChange(event.currentTarget.value)}
											error={error}
										/>
									);
								}}
							</form.Field>
							<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
								{([canSubmit, isSubmitting]) => (
									<Button type="submit" fullWidth disabled={!canSubmit} loading={isSubmitting}>
										Войти
									</Button>
								)}
							</form.Subscribe>
						</Stack>
					</form>

					{providers.length > 0 && (
						<>
							<Divider label="или" labelPosition="center" />
							<Group gap="md" justify="center">
								{providers.map((provider) => (
									<OAuthProviderButton
										key={provider.id}
										providerId={provider.id}
										label={provider.label}
									/>
								))}
							</Group>
						</>
					)}
				</Stack>
			</Box>
		</PageFrame>
	);
};
