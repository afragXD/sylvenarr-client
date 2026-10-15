import { Anchor, Box, Button, Stack, Text, TextInput, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { type FormEvent, useState } from 'react';

import { PageFrame } from '@/shared/ui/PageFrame';

/**
 * Заглушка входа (без API).
 */
export const SignInPage = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [notice, setNotice] = useState<string | null>(null);

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();
		setNotice('Вход скоро откроется. Пока можно смотреть реестр героев.');
	};

	return (
		<PageFrame width="form">
			<Box className="sylvenarr-panel">
				<Stack gap={6}>
					<Title order={1}>Войти</Title>
					<Text c="var(--app-text-muted)">
						Войдите в аккаунт Sylvenarr. Сейчас это заглушка без серверной сессии.
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
							autoComplete="current-password"
							required
							value={password}
							onChange={(event) => setPassword(event.currentTarget.value)}
							placeholder="Ваш пароль"
						/>
						<Button className="sylvenarr-plate-btn" type="submit" color="brand">
							Войти
						</Button>
						{notice && (
							<Text size="sm" c="brand" role="status">
								{notice}
							</Text>
						)}
						<Text size="sm" c="var(--app-text-muted)">
							Нет аккаунта?{' '}
							<Anchor component={Link} to="/sign-up" c="brand" fw={600}>
								Создать аккаунт
							</Anchor>
						</Text>
					</Stack>
				</form>
			</Box>
		</PageFrame>
	);
};
