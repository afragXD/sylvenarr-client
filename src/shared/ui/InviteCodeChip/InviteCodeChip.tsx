import { Box, Text, UnstyledButton } from '@mantine/core';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import styles from './InviteCodeChip.module.css';

type InviteCodeChipProps = {
	code: string;
	/** Компактный вид в строке статуса. */
	compact?: boolean;
};

/**
 * Код приглашения с копированием в буфер (код + иконка).
 */
export const InviteCodeChip = ({ code, compact = false }: InviteCodeChipProps) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1600);
		} catch {
			/* ignore clipboard errors */
		}
	};

	const icon = copied ? (
		<Check size={14} color="var(--mantine-color-accent-filled)" aria-hidden />
	) : (
		<Copy size={14} color="var(--app-text-muted)" aria-hidden />
	);

	const button = (
		<UnstyledButton
			onClick={() => void handleCopy()}
			title={copied ? 'Скопировано' : 'Скопировать код'}
			aria-label={`Скопировать код ${code}`}
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 8,
				letterSpacing: compact ? '0.1em' : '0.12em',
			}}
		>
			<Text span ff="monospace" fw={700} c="var(--app-text)">
				{code}
			</Text>
			{icon}
		</UnstyledButton>
	);

	if (compact) {
		return button;
	}

	return <Box className={styles.plate}>{button}</Box>;
};
