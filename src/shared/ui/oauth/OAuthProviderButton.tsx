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
	const icon =
		providerId === 'yandex' ? (
			<YandexIcon size={26} />
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
			size={48}
			radius={0}
			aria-label={`Войти через ${label}`}
			title={`Войти через ${label}`}
			className="sylvenarr-oauth-icon-btn"
		>
			{icon}
		</ActionIcon>
	);
};
