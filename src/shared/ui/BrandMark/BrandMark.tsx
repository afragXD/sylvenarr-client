import { Group, Text, UnstyledButton } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { APP_TITLE } from '@/shared/constants';

import { RuneGateIcon } from './RuneGateIcon';

type BrandMarkProps = {
	/** Размер иконки в px */
	size?: number;
	/** Показать wordmark рядом с mark */
	withWordmark?: boolean;
	/** Крупный вариант для лендинга */
	variant?: 'header' | 'hero';
	to?: string;
};

/**
 * Rune Gate mark + wordmark Sylvenarr.
 */
export const BrandMark = ({
	size = 28,
	withWordmark = true,
	variant = 'header',
	to = '/',
}: BrandMarkProps) => {
	const isHero = variant === 'hero';

	return (
		<UnstyledButton component={Link} to={to} c="var(--app-text)" style={{ display: 'inline-flex' }}>
			<Group gap={isHero ? 'md' : 'sm'} wrap="nowrap" align="center">
				<RuneGateIcon size={size} />
				{withWordmark && (
					<Text
						component={isHero ? 'h1' : 'span'}
						fw={700}
						size={isHero ? undefined : 'lg'}
						ff="var(--mantine-font-family-headings)"
						c="var(--app-text)"
						lh={1.1}
						style={{
							letterSpacing: isHero ? '0.02em' : '0.01em',
							fontSize: isHero ? 'clamp(2.75rem, 7vw, 5.25rem)' : undefined,
						}}
					>
						{APP_TITLE}
					</Text>
				)}
			</Group>
		</UnstyledButton>
	);
};
