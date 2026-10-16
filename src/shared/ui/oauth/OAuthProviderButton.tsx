import { ActionIcon, Text } from '@mantine/core';

import { getOAuthStartUrl } from '@/entities/player';

import { YandexIcon } from './YandexIcon';

type OAuthProviderButtonProps = {
	readonly providerId: string;
	readonly label: string;
};

/**
 * Компактная иконка-кнопка входа через OAuth-провайдера.
 */
export const OAuthProviderButton = ({ providerId, label }: OAuthProviderButtonProps) => {
	const isYandex = providerId === 'yandex';
	const icon = isYandex ? (
		<YandexIcon size={18} />
	) : (
		<Text size="sm" fw={700} tt="uppercase" c="var(--app-text)">
			{label.slice(0, 1)}
		</Text>
	);

	return (
		<ActionIcon
			component="a"
			href={getOAuthStartUrl(providerId)}
			variant="default"
			size={52}
			radius={8}
			aria-label={`Войти через ${label}`}
			title={`Войти через ${label}`}
			className={
				isYandex
					? 'sylvenarr-oauth-icon-btn sylvenarr-oauth-icon-btn--yandex'
					: 'sylvenarr-oauth-icon-btn'
			}
		>
			{icon}
		</ActionIcon>
	);
};
