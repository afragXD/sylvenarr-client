import { Avatar, Stack, Text, TextInput } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import {
	fetchCurrentPlayer,
	type Player,
	playerUpdated,
	updateMyProfile,
	uploadMyAvatar,
} from '@/entities/player';
import { resolveStaticUrl } from '@/shared/lib/staticUrl';
import { OrnateButton } from '@/shared/ui/OrnateButton';

const initialsFromName = (name: string): string => {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) {
		return '?';
	}
	if (parts.length === 1) {
		return parts[0].slice(0, 2).toUpperCase();
	}
	return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
};

/**
 * Настройки аккаунта: имя и аватар.
 */
export const ProfileSettingsPage = () => {
	const navigate = useNavigate();
	const [player, setPlayer] = useState<Player | null>(null);
	const [displayName, setDisplayName] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);
	const fileRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		void fetchCurrentPlayer()
			.then((me) => {
				setPlayer(me);
				setDisplayName(me.displayName);
			})
			.catch(() => {
				void navigate({ to: '/sign-in' });
			});
	}, [navigate]);

	const saveName = async () => {
		setSaving(true);
		setError(null);
		try {
			const updated = await updateMyProfile(displayName.trim());
			setPlayer(updated);
			setDisplayName(updated.displayName);
			playerUpdated(updated);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Не удалось сохранить');
		} finally {
			setSaving(false);
		}
	};

	const onAvatarFile = async (file: File | undefined) => {
		if (!file) {
			return;
		}
		setUploading(true);
		setError(null);
		try {
			const updated = await uploadMyAvatar(file);
			setPlayer(updated);
			playerUpdated(updated);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Не удалось загрузить аватар');
		} finally {
			setUploading(false);
			if (fileRef.current) {
				fileRef.current.value = '';
			}
		}
	};

	if (!player) {
		return <Text c="dimmed">Загрузка…</Text>;
	}

	const avatarSrc = resolveStaticUrl(player.avatarUrl) ?? player.avatarUrl ?? undefined;

	return (
		<Stack gap="md" maw={420}>
			{error ? <Text c="accent">{error}</Text> : null}
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
				<Avatar src={avatarSrc} alt="" radius="xl" size={72} color="brand">
					{initialsFromName(player.displayName)}
				</Avatar>
				<div>
					<input
						ref={fileRef}
						type="file"
						accept="image/webp,image/png,image/jpeg,image/gif,image/avif"
						hidden
						onChange={(event) => void onAvatarFile(event.currentTarget.files?.[0])}
					/>
					<OrnateButton
						variant="outline"
						disabled={uploading || saving}
						onClick={() => fileRef.current?.click()}
					>
						{uploading ? 'Загрузка…' : 'Загрузить'}
					</OrnateButton>
					<Text size="sm" c="dimmed" mt={6}>
						webp / png / jpg, до 2 МБ
					</Text>
				</div>
			</div>
			<TextInput
				label="Имя"
				value={displayName}
				onChange={(event) => setDisplayName(event.currentTarget.value)}
				description="От 2 до 32 символов, уникальное"
				radius={0}
				maxLength={32}
			/>
			<OrnateButton
				variant="parchment"
				withDiamonds={false}
				disabled={saving || uploading || displayName.trim() === player.displayName}
				onClick={() => void saveName()}
			>
				{saving ? 'Сохранение…' : 'Сохранить имя'}
			</OrnateButton>
			{displayName.trim() === player.displayName ? (
				<Text size="sm" c="var(--app-text-muted)">
					Измените имя, чтобы сохранить
				</Text>
			) : null}
		</Stack>
	);
};
