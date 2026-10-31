import { Button, Text } from '@mantine/core';

import { getOAuthStartUrl } from '@/entities/player';
import { setAuthRedirect } from '@/shared/lib/authRedirect';

import { YandexIcon } from './YandexIcon';

type OAuthProviderButtonProps = {
	readonly providerId: string;
	readonly label: string;
	/** Куда вернуться после OAuth (уже в sessionStorage с /sign-in?redirect=…). */
	readonly rememberRedirect?: string;
};

/**
 * Кнопка входа через провайдера: иконка + видимый текст (AC-4 / R1-M5).
 */
export const OAuthProviderButton = ({
	providerId,
	label,
	rememberRedirect,
}: OAuthProviderButtonProps) => {
	const isYandex = providerId === 'yandex';
	const visibleLabel = isYandex ? 'Яндекс' : label;

	return (
		<Button
			component="a"
			href={getOAuthStartUrl(providerId)}
			variant="default"
			radius={8}
			size="md"
			leftSection={
				isYandex ? (
					<YandexIcon size={18} />
				) : (
					<Text size="sm" fw={700} tt="uppercase" c="var(--app-text)" component="span">
						{label.slice(0, 1)}
					</Text>
				)
			}
			className={
				isYandex ? 'sylvenarr-oauth-btn sylvenarr-oauth-btn--yandex' : 'sylvenarr-oauth-btn'
			}
			onClick={() => {
				if (rememberRedirect) {
					setAuthRedirect(rememberRedirect);
				}
			}}
		>
			{visibleLabel}
		</Button>
	);
};
