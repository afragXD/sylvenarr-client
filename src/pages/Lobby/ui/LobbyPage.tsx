import { Anchor, Box, Button, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { createMatch, joinMatch } from '@/entities/match';
import { fetchCurrentPlayer, type Player } from '@/entities/player';
import { ApiError } from '@/shared/api/http';
import { PageFrame } from '@/shared/ui/PageFrame';

export const LobbyPage = () => {
	const navigate = useNavigate();
	const [player, setPlayer] = useState<Player | null>(null);
	const [sessionChecked, setSessionChecked] = useState(false);
	const [inviteInput, setInviteInput] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isBusy, setIsBusy] = useState(false);

	useEffect(() => {
		let isMounted = true;
		const boot = async () => {
			try {
				const current = await fetchCurrentPlayer();
				if (isMounted) {
					setPlayer(current);
				}
			} catch {
				if (isMounted) {
					setPlayer(null);
				}
			} finally {
				if (isMounted) {
					setSessionChecked(true);
				}
			}
		};
		void boot();
		return () => {
			isMounted = false;
		};
	}, []);

	const handleCreate = async () => {
		if (!player) {
			return;
		}
		setIsBusy(true);
		setError(null);
		try {
			const created = await createMatch();
			await navigate({ to: '/lobby/$matchId', params: { matchId: created.id } });
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Ошибка создания матча');
		} finally {
			setIsBusy(false);
		}
	};

	const handleJoin = async () => {
		if (!player) {
			return;
		}
		setIsBusy(true);
		setError(null);
		try {
			const joined = await joinMatch(inviteInput.trim());
			await navigate({ to: '/lobby/$matchId', params: { matchId: joined.id } });
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Ошибка входа в матч');
		} finally {
			setIsBusy(false);
		}
	};

	return (
		<PageFrame width="wide">
			<Stack gap={6} maw={640}>
				<Title order={1}>Лобби</Title>
				<Text c="var(--app-text-muted)">
					Создайте матч и передайте код другу. После входа начнётся draft отряда.
				</Text>
			</Stack>

			{sessionChecked && !player && (
				<Box className="sylvenarr-panel" maw={480}>
					<Stack gap="md">
						<Text>
							Чтобы создавать матчи и заходить по коду, войдите через OAuth.
						</Text>
						<Button className="sylvenarr-plate-btn" color="brand" component={Link} to="/sign-in">
							Войти
						</Button>
					</Stack>
				</Box>
			)}

			{player && (
				<Stack gap="md" maw={440} w={{ base: '100%', md: 440 }}>
					<Text size="sm" c="var(--app-text-muted)">
						Вы:{' '}
						<Text span fw={600} c="var(--app-text)">
							{player.displayName}
						</Text>
					</Text>
					<Button
						className="sylvenarr-plate-btn"
						color="brand"
						loading={isBusy}
						onClick={() => void handleCreate()}
					>
						Создать матч
					</Button>
					<Group align="flex-end" gap="sm" wrap="nowrap">
						<TextInput
							label="Код приглашения"
							value={inviteInput}
							onChange={(event) => setInviteInput(event.currentTarget.value.toUpperCase())}
							placeholder="ABC123"
							style={{ flex: 1, minWidth: 0 }}
							styles={{
								input: {
									fontFamily: 'var(--mantine-font-family-monospace)',
									letterSpacing: '0.08em',
								},
							}}
						/>
						<Button
							variant="light"
							color="accent"
							loading={isBusy}
							disabled={inviteInput.trim().length < 4}
							onClick={() => void handleJoin()}
						>
							Войти в матч
						</Button>
					</Group>
					{error && (
						<Text c="red" role="alert">
							{error}
						</Text>
					)}
				</Stack>
			)}

			{sessionChecked && player && (
				<Text size="sm" c="var(--app-text-muted)">
					Не тот аккаунт?{' '}
					<Anchor component={Link} to="/sign-in" c="brand" fw={600}>
						Сменить вход
					</Anchor>
				</Text>
			)}
		</PageFrame>
	);
};
