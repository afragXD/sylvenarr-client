import { Anchor, Box, Button, Stack, Text, TextInput, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { type FormEvent, useState } from 'react';

import { PageFrame } from '@/shared/ui/PageFrame';

/**
 * Заглушка регистрации (без API).
 */
export const SignUpPage = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [notice, setNotice] = useState<string | null>(null);

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();
		setNotice('Регистрация скоро откроется. Пока можно смотреть реестр героев.');
	};

	return (
		<PageFrame width="form">
			<Box className="sylvenarr-panel">
				<Stack gap={6}>
					<Title order={1}>Создать аккаунт</Title>
					<Text c="var(--app-text-muted)">
						Email и пароль. Авторизация в API появится в следующей фазе.
					</Text>
				</Stack>
				<form onSubmit={handleSubmit}>
					<Stack gap="md" mt="lg">
						<TextInput
							label="Email"
							type="email"
							autoComplete="email"
							required
							value={email}
							onChange={(event) => setEmail(event.currentTarget.value)}
							placeholder="you@example.com"
						/>
						<TextInput
							label="Пароль"
							type="password"
							autoComplete="new-password"
							required
							value={password}
							onChange={(event) => setPassword(event.currentTarget.value)}
							placeholder="Минимум 8 символов"
						/>
						<Button className="sylvenarr-plate-btn" type="submit" color="brand">
							Создать аккаунт
						</Button>
						{notice && (
							<Text size="sm" c="brand" role="status">
								{notice}
							</Text>
						)}
						<Text size="sm" c="var(--app-text-muted)">
							Уже есть аккаунт?{' '}
							<Anchor component={Link} to="/sign-in" c="brand" fw={600}>
								Войти
							</Anchor>
						</Text>
					</Stack>
				</form>
			</Box>
		</PageFrame>
	);
};
