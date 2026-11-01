import {
	Alert,
	Box,
	Button,
	Divider,
	Group,
	PasswordInput,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useUnit } from 'effector-react';
import { useEffect, useState } from 'react';

import {
	$player,
	type AuthProvider,
	fetchAuthProviders,
	fetchCurrentPlayer,
	loginWithPassword,
	logoutFx,
	type Player,
	playerUpdated,
} from '@/entities/player';
import { ApiError } from '@/shared/api/http';
import { setAuthRedirect, takeAuthRedirect } from '@/shared/lib/authRedirect';
import { OAuthProviderButton } from '@/shared/ui/oauth';
import { PageFrame } from '@/shared/ui/PageFrame';

import { signInSchema } from '../model/signInSchema';

const goAfterSignIn = async (navigate: ReturnType<typeof useNavigate>): Promise<void> => {
	const redirect = takeAuthRedirect();
	if (redirect) {
		window.location.assign(redirect);
		return;
	}
	await navigate({ to: '/lobby' });
};

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
 * Вход: логин/почта + пароль или провайдер (Яндекс).
 */
export const SignInPage = () => {
	const search = useSearch({ from: '/sign-in' });
	const navigate = useNavigate();
	const storePlayer = useUnit($player);
	const authError = search.auth === 'error';
	const [providers, setProviders] = useState<AuthProvider[]>([]);
	const [loadError, setLoadError] = useState<string | null>(null);
	/** undefined — ещё проверяем сессию; не показываем форму раньше времени. */
	const [sessionChecked, setSessionChecked] = useState(false);
	const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
	const [serverError, setServerError] = useState<string | null>(null);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	useEffect(() => {
		if (typeof search.redirect === 'string') {
			/* небезопасное → sanitize → «/» (без open redirect) */
			setAuthRedirect(search.redirect);
		}
	}, [search.redirect]);

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
				const me = await fetchCurrentPlayer();
				if (!me) {
					setServerError('Не удалось подтвердить вход');
					return;
				}
				playerUpdated(me);
				await goAfterSignIn(navigate);
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
			.then((me) => {
				if (!mounted) {
					return;
				}
				setLocalPlayer(me);
				if (me) {
					playerUpdated(me);
				}
			})
			.catch(() => {
				if (mounted) {
					setLocalPlayer(null);
				}
			})
			.finally(() => {
				if (mounted) {
					setSessionChecked(true);
				}
			});
		return () => {
			mounted = false;
		};
	}, []);

	const signedIn = localPlayer ?? storePlayer;

	const handleSwitchAccount = async () => {
		setIsLoggingOut(true);
		try {
			await logoutFx();
			setLocalPlayer(null);
		} catch {
			/* ignore */
		} finally {
			setIsLoggingOut(false);
		}
	};

	if (!sessionChecked) {
		return (
			<PageFrame width="form" eyebrow="Арена" title="Войти" lead="Вход через Яндекс или по логину">
				<Box className="sylvenarr-panel">
					<Text c="var(--app-text-muted)">Проверяем сессию…</Text>
				</Box>
			</PageFrame>
		);
	}

	if (signedIn) {
		return (
			<PageFrame width="form" eyebrow="Арена" title="Аккаунт">
				<Box className="sylvenarr-panel">
					<Text>
						Вы вошли как {signedIn.displayName} ·{' '}
						<Text component={Link} to="/lobby" c="brand" span fw={600} td="underline">
							В лобби
						</Text>{' '}
						·{' '}
						<Text
							component="button"
							type="button"
							c="brand"
							span
							fw={600}
							td="underline"
							style={{
								background: 'none',
								border: 0,
								padding: 0,
								cursor: isLoggingOut ? 'wait' : 'pointer',
								font: 'inherit',
							}}
							disabled={isLoggingOut}
							onClick={() => void handleSwitchAccount()}
						>
							Выйти и войти другим аккаунтом
						</Text>
					</Text>
				</Box>
			</PageFrame>
		);
	}

	return (
		<PageFrame
			width="form"
			eyebrow="Арена"
			title="Войти"
			lead="Вход через Яндекс или по логину. Рейтинг и история матчей закрепляются за вами."
		>
			<Box className="sylvenarr-panel">
				<Stack gap="md">
					{authError && (
						<Alert color="red" title="Не удалось войти" role="alert">
							Попробуйте ещё раз. Если ошибка повторяется — проверьте настройки входа через Яндекс.
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
									<Button
										type="submit"
										color="brand"
										fullWidth
										disabled={!canSubmit}
										loading={isSubmitting}
									>
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
										rememberRedirect={
											typeof search.redirect === 'string' ? search.redirect : undefined
										}
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
