import { Avatar, Group, Text, type AvatarProps } from '@mantine/core';
import type { ReactNode } from 'react';

import { resolveStaticUrl } from '@/shared/lib/staticUrl';

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

type PlayerAvatarProps = {
	name: string;
	avatarUrl?: string | null;
	size?: AvatarProps['size'];
};

/**
 * Аватар игрока: volume `/static/…`, внешний URL или инициалы.
 */
export const PlayerAvatar = ({ name, avatarUrl, size = 28 }: PlayerAvatarProps) => {
	const src = resolveStaticUrl(avatarUrl) ?? avatarUrl ?? undefined;
	return (
		<Avatar src={src} alt="" radius="xl" size={size} color="brand">
			{initialsFromName(name)}
		</Avatar>
	);
};

type PlayerIdentityProps = {
	name: string;
	avatarUrl?: string | null;
	/** Например «Игрок 1» — перед именем через · */
	prefix?: string;
	size?: AvatarProps['size'];
	fw?: number;
	muted?: boolean;
	children?: ReactNode;
};

/**
 * Аватар + имя в одну строку (рейтинг, матчи, бой).
 */
export const PlayerIdentity = ({
	name,
	avatarUrl,
	prefix,
	size = 28,
	fw = 600,
	muted = false,
}: PlayerIdentityProps) => (
	<Group gap={8} wrap="nowrap" align="center" style={{ minWidth: 0 }}>
		<PlayerAvatar name={name} avatarUrl={avatarUrl} size={size} />
		<Text
			size="sm"
			fw={fw}
			c={muted ? 'var(--app-text-muted)' : 'var(--app-text)'}
			lineClamp={1}
			style={{ minWidth: 0 }}
		>
			{prefix ? `${prefix} · ${name}` : name}
		</Text>
	</Group>
);
