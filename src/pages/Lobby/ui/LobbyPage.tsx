import { Anchor, Box, Button, Group, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import {
	createMatch,
	joinMatch,
	loadLobbyRulesPrefs,
	saveLobbyRulesPrefs,
	type MatchRules,
	validateMatchRules,
} from '@/entities/match';
import { fetchCurrentPlayer, type Player } from '@/entities/player';
import { fetchPresets, type SquadPreset } from '@/entities/presets';
import { ApiError } from '@/shared/api/http';
import { setPendingLobbyDraftPresetId } from '@/shared/lib/lobbyDraftPreset';
import { PageFrame } from '@/shared/ui/PageFrame';
import { PlayerIdentity } from '@/shared/ui/PlayerAvatar';

import styles from './LobbyPage.module.css';
import { LobbyRulesForm } from './LobbyRulesForm';

export const LobbyPage = () => {
	const navigate = useNavigate();
	const [player, setPlayer] = useState<Player | null>(null);
	const [sessionChecked, setSessionChecked] = useState(false);
	const [inviteInput, setInviteInput] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isBusy, setIsBusy] = useState(false);
	const [rules, setRules] = useState<MatchRules>(() => loadLobbyRulesPrefs());
	const [presets, setPresets] = useState<SquadPreset[]>([]);
	const [presetsLoading, setPresetsLoading] = useState(false);
	const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

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

	useEffect(() => {
		if (!player) {
			setPresets([]);
			setSelectedPresetId(null);
			return;
		}
		let alive = true;
		setPresetsLoading(true);
		void fetchPresets({ teamSize: rules.initialTeamSize, scope: 'mine' })
			.then((list) => {
				if (!alive) {
					return;
				}
				const personal = list.filter((preset) => !preset.isGlobal);
				setPresets(personal);
				setSelectedPresetId((prev) =>
					prev && personal.some((preset) => preset.id === prev) ? prev : null,
				);
			})
			.catch(() => {
				if (alive) {
					setPresets([]);
					setSelectedPresetId(null);
				}
			})
			.finally(() => {
				if (alive) {
					setPresetsLoading(false);
				}
			});
		return () => {
			alive = false;
		};
	}, [player, rules.initialTeamSize]);

	const presetOptions = useMemo(
		() => presets.map((preset) => ({ value: preset.id, label: preset.name })),
		[presets],
	);

	const stashPresetAndNavigate = async (matchId: string) => {
		setPendingLobbyDraftPresetId(selectedPresetId);
		await navigate({ to: '/lobby/$matchId', params: { matchId } });
	};

	const handleCreate = async () => {
		if (!player) {
			return;
		}
		const validated = validateMatchRules(rules);
		if (!validated.ok) {
			setError(validated.message);
			return;
		}
		setIsBusy(true);
		setError(null);
		try {
			const created = await createMatch(validated.rules);
			saveLobbyRulesPrefs(validated.rules);
			await stashPresetAndNavigate(created.id);
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
			await stashPresetAndNavigate(joined.id);
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Ошибка входа в матч');
		} finally {
			setIsBusy(false);
		}
	};

	const canCreate = validateMatchRules(rules).ok;

	return (
		<PageFrame width="wide">
			<Stack gap={6} maw={640}>
				<Title order={1}>Лобби</Title>
				<Text c="var(--app-text-muted)">
					Создайте матч и передайте код другу. После входа начнётся набор отряда.
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
				<div className={styles.layout}>
					<LobbyRulesForm rules={rules} onChange={setRules} />

					<div className={`sylvenarr-panel ${styles.actions}`}>
						<Group gap="xs" align="center">
							<Text size="sm" c="var(--app-text-muted)">
								Вы:
							</Text>
							<PlayerIdentity
								name={player.displayName}
								avatarUrl={player.avatarUrl}
								size={28}
							/>
						</Group>

						{/* AC-3.13: пресет до «Создать матч» */}
						{presetsLoading ? (
							<Text size="sm" c="var(--app-text-muted)">
								Загрузка пресетов…
							</Text>
						) : presets.length === 0 ? (
							<Text size="sm" c="var(--app-text-muted)" className={styles.presetEmpty}>
								Пресетов пока нет
							</Text>
						) : (
							<Select
								label="Пресет отряда"
								description="Применится в драфте, если отряд ещё пуст"
								placeholder="Без пресета"
								clearable
								data={presetOptions}
								value={selectedPresetId}
								onChange={setSelectedPresetId}
								disabled={isBusy}
							/>
						)}

						<Button
							className="sylvenarr-plate-btn"
							color="brand"
							loading={isBusy}
							disabled={!canCreate}
							onClick={() => void handleCreate()}
						>
							Создать матч
						</Button>

						<Stack gap="sm">
							<Text size="sm" fw={600}>
								Уже есть код?
							</Text>
							<Group align="flex-end" gap="sm" wrap="nowrap">
								<TextInput
									label="Код приглашения"
									value={inviteInput}
									onChange={(event) =>
										setInviteInput(event.currentTarget.value.toUpperCase())
									}
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
						</Stack>

						{error && (
							<Text c="red" role="alert">
								{error}
							</Text>
						)}

						<Text size="sm" c="var(--app-text-muted)">
							Не тот аккаунт?{' '}
							<Anchor component={Link} to="/sign-in" c="brand" fw={600}>
								Сменить вход
							</Anchor>
						</Text>
					</div>
				</div>
			)}
		</PageFrame>
	);
};
