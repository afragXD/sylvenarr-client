import { Box, Button, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { useEffect, useState } from 'react';

import { cancelMatch, createMatch, fetchMatchById, joinMatch, type Match } from '@/entities/match';
import { ensureGuestPlayer, fetchCurrentPlayer, type Player } from '@/entities/player';
import { ApiError } from '@/shared/api/http';
import { PageFrame } from '@/shared/ui/PageFrame';

const POLL_MS = 2500;

export const LobbyPage = () => {
	const [player, setPlayer] = useState<Player | null>(null);
	const [match, setMatch] = useState<Match | null>(null);
	const [inviteInput, setInviteInput] = useState('');
	const [nameInput, setNameInput] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isBusy, setIsBusy] = useState(false);

	useEffect(() => {
		let isMounted = true;
		const boot = async () => {
			try {
				const current = await fetchCurrentPlayer();
				if (isMounted) {
					setPlayer(current);
					setNameInput(current.displayName);
				}
			} catch {
				if (isMounted) {
					setPlayer(null);
				}
			}
		};
		void boot();
		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (!match || match.status !== 'waiting') {
			return;
		}
		const timer = window.setInterval(() => {
			void fetchMatchById(match.id)
				.then((next) => {
					setMatch(next);
				})
				.catch(() => {
					/* ignore transient poll errors */
				});
		}, POLL_MS);
		return () => {
			window.clearInterval(timer);
		};
	}, [match]);

	const ensureSession = async (): Promise<Player> => {
		const guest = await ensureGuestPlayer(nameInput.trim() || undefined);
		setPlayer(guest);
		return guest;
	};

	const handleCreate = async () => {
		setIsBusy(true);
		setError(null);
		try {
			await ensureSession();
			const created = await createMatch();
			setMatch(created);
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Ошибка создания матча');
		} finally {
			setIsBusy(false);
		}
	};

	const handleJoin = async () => {
		setIsBusy(true);
		setError(null);
		try {
			await ensureSession();
			const joined = await joinMatch(inviteInput.trim());
			setMatch(joined);
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Ошибка входа в матч');
		} finally {
			setIsBusy(false);
		}
	};

	const handleCancel = async () => {
		if (!match) {
			return;
		}
		setIsBusy(true);
		setError(null);
		try {
			const cancelled = await cancelMatch(match.id);
			setMatch(cancelled);
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Ошибка отмены');
		} finally {
			setIsBusy(false);
		}
	};

	const isHost = Boolean(player && match && player.id === match.host.id);

	return (
		<PageFrame width="wide">
			<Stack gap={6} maw={640}>
				<Title order={1}>Лобби</Title>
				<Text c="var(--app-text-muted)">
					Создайте матч и передайте код другу. Бой — в следующих фазах миграции.
				</Text>
			</Stack>

			<Group
				align="stretch"
				gap={{ base: 'xl', md: 56 }}
				wrap="wrap"
				preventGrowOverflow={false}
				w="100%"
			>
				<Stack gap="md" maw={440} w={{ base: '100%', md: 440 }} style={{ flexShrink: 0 }}>
					{player && (
						<Text size="sm" c="var(--app-text-muted)">
							Вы:{' '}
							<Text span fw={600} c="var(--app-text)">
								{player.displayName}
							</Text>
						</Text>
					)}
					<TextInput
						label="Имя (для нового гостя)"
						value={nameInput}
						onChange={(event) => setNameInput(event.currentTarget.value)}
						placeholder="Гость"
					/>
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
							Войти
						</Button>
					</Group>
					{error && (
						<Text c="red" role="alert">
							{error}
						</Text>
					)}
				</Stack>

				<Box
					className="sylvenarr-status-rail"
					style={{
						minHeight: 200,
						flex: '1 1 320px',
						minWidth: 280,
					}}
				>
					{match ? (
						<Stack gap="sm">
							<Text fw={600}>Статус: {statusLabel(match.status)}</Text>
							<Box className="sylvenarr-invite-plate">{match.inviteCode}</Box>
							<Text size="sm" c="var(--app-text-muted)">
								Хост: {match.host.displayName}
							</Text>
							<Text size="sm" c="var(--app-text-muted)">
								Гость: {match.guest?.displayName ?? 'ожидание…'}
							</Text>
							{isHost && match.status !== 'cancelled' && (
								<Button
									variant="outline"
									color="red"
									loading={isBusy}
									mt="xs"
									w={{ base: '100%', sm: 'auto' }}
									onClick={() => void handleCancel()}
								>
									Отменить
								</Button>
							)}
							{match.status === 'ready' && (
								<Text c="accent" size="sm">
									Оба игрока на месте. Draft и бой появятся в фазе 2–3.
								</Text>
							)}
						</Stack>
					) : (
						<Stack gap={6} justify="center" h="100%">
							<Text fw={600}>Зал ожидания</Text>
							<Text size="sm" c="var(--app-text-muted)" maw={360}>
								Создайте матч или войдите по коду — статус появится здесь.
							</Text>
						</Stack>
					)}
				</Box>
			</Group>
		</PageFrame>
	);
};

const statusLabel = (status: Match['status']): string => {
	switch (status) {
		case 'waiting':
			return 'ожидание соперника';
		case 'ready':
			return 'готово';
		case 'cancelled':
			return 'отменён';
		default:
			return status;
	}
};
