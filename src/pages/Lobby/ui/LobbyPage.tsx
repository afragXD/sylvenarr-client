import { Anchor, Box, Button, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
	createMatch,
	joinMatch,
	loadLobbyRulesPrefs,
	type MatchRules,
	saveLobbyRulesPrefs,
	validateMatchRules,
} from '@/entities/match';
import { fetchCurrentPlayer, type Player, playerUpdated } from '@/entities/player';
import { fetchPresets, type SquadPreset } from '@/entities/presets';
import { ApiError } from '@/shared/api/http';
import { setPendingLobbyDraftPresetId } from '@/shared/lib/lobbyDraftPreset';
import { PageFrame } from '@/shared/ui/PageFrame';
import { PlayerIdentity } from '@/shared/ui/PlayerAvatar';

import { Route } from '../../../routes/lobby.index';
import styles from './LobbyPage.module.css';
import { LobbyRulesForm } from './LobbyRulesForm';

type BusyAction = 'create' | 'join' | null;

const sanitizeInviteCode = (raw: string): string =>
	raw
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, '')
		.slice(0, 6);

export const LobbyPage = () => {
	const navigate = useNavigate();
	const search = Route.useSearch();
	const [player, setPlayer] = useState<Player | null>(null);
	const [sessionChecked, setSessionChecked] = useState(false);
	const [inviteInput, setInviteInput] = useState(() => search.code ?? '');
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState<BusyAction>(null);
	const [rules, setRules] = useState<MatchRules>(() => loadLobbyRulesPrefs());
	const [presets, setPresets] = useState<SquadPreset[]>([]);
	const [presetsLoading, setPresetsLoading] = useState(false);
	const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
	const autoJoinTried = useRef(false);

	useEffect(() => {
		let isMounted = true;
		void fetchCurrentPlayer()
			.then((current) => {
				if (!isMounted) {
					return;
				}
				setPlayer(current);
				if (current) {
					playerUpdated(current);
				}
			})
			.catch(() => {
				if (isMounted) {
					setPlayer(null);
				}
			})
			.finally(() => {
				if (isMounted) {
					setSessionChecked(true);
				}
			});
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
		if (!player || busy) {
			return;
		}
		const validated = validateMatchRules(rules);
		if (!validated.ok) {
			setError(validated.message);
			return;
		}
		setBusy('create');
		setError(null);
		try {
			const created = await createMatch(validated.rules);
			saveLobbyRulesPrefs(validated.rules);
			await stashPresetAndNavigate(created.id);
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Ошибка создания матча');
		} finally {
			setBusy(null);
		}
	};

	const handleJoin = useCallback(
		async (codeOverride?: string) => {
			if (!player || busy) {
				return;
			}
			const code = sanitizeInviteCode(codeOverride ?? inviteInput);
			if (code.length === 0) {
				setError('Введите код');
				return;
			}
			setBusy('join');
			setError(null);
			try {
				const joined = await joinMatch(code);
				await stashPresetAndNavigate(joined.id);
			} catch (err) {
				setError(err instanceof ApiError ? err.message : 'Ошибка входа в матч');
			} finally {
				setBusy(null);
			}
		},
		[busy, inviteInput, player, selectedPresetId, navigate],
	);

	/** AC-7: ссылка /lobby?code=… у второго аккаунта → join → драфт. */
	useEffect(() => {
		if (!sessionChecked || !player || autoJoinTried.current || !search.code) {
			return;
		}
		autoJoinTried.current = true;
		setInviteInput(search.code);
		void handleJoin(search.code);
	}, [sessionChecked, player, search.code, handleJoin]);

	const canCreate = validateMatchRules(rules).ok;

	return (
		<PageFrame
			width="wide"
			eyebrow="Арена"
			title="Лобби"
			lead="Создайте матч и передайте ссылку другу. После входа начнётся набор отряда."
		>
			{sessionChecked && !player && (
				<Box className="sylvenarr-panel" maw={480}>
					<Stack gap="md">
						<Text c="var(--app-text-muted)">
							Войдите, чтобы создавать матчи и заходить по коду.
						</Text>
						<Button
							className="sylvenarr-plate-btn"
							color="brand"
							component={Link}
							to="/sign-in"
							search={{
								redirect: search.code
									? `/lobby?code=${encodeURIComponent(search.code)}`
									: '/lobby',
							}}
						>
							Войти и играть
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
							<PlayerIdentity name={player.displayName} avatarUrl={player.avatarUrl} size={28} />
						</Group>

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
								disabled={busy !== null}
							/>
						)}

						<Button
							className="sylvenarr-plate-btn"
							color="brand"
							loading={busy === 'create'}
							disabled={!canCreate || busy === 'join'}
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
									description="6 символов, латиница"
									value={inviteInput}
									maxLength={6}
									onChange={(event) => {
										setInviteInput(sanitizeInviteCode(event.currentTarget.value));
										if (error === 'Введите код') {
											setError(null);
										}
									}}
									placeholder="ABC123"
									style={{ flex: 1, minWidth: 0 }}
									styles={{
										input: {
											fontFamily: 'var(--mantine-font-family-monospace)',
											letterSpacing: '0.08em',
										},
									}}
									disabled={busy !== null}
								/>
								<Button
									variant="light"
									color="accent"
									loading={busy === 'join'}
									disabled={busy === 'create'}
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
