import { Box, Button, Group, Text, UnstyledButton } from '@mantine/core';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

type InviteCodeChipProps = {
	code: string;
	/** Компактный вид в строке статуса. */
	compact?: boolean;
};

/**
 * Код приглашения с копированием в буфер.
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

	if (compact) {
		return (
			<UnstyledButton
				onClick={() => void handleCopy()}
				title="Скопировать код"
				aria-label={`Скопировать код ${code}`}
				style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
			>
				<Text span ff="monospace" fw={700} c="var(--app-text)" style={{ letterSpacing: '0.1em' }}>
					{code}
				</Text>
				{copied ? (
					<Check size={14} color="var(--mantine-color-accent-filled)" aria-hidden />
				) : (
					<Copy size={14} color="var(--app-text-muted)" aria-hidden />
				)}
			</UnstyledButton>
		);
	}

	return (
		<Box className="sylvenarr-invite-plate">
			<Group gap="sm" wrap="nowrap">
				<UnstyledButton
					onClick={() => void handleCopy()}
					aria-label={`Скопировать код ${code}`}
					style={{ letterSpacing: '0.12em' }}
				>
					{code}
				</UnstyledButton>
				<Button
					variant="light"
					color="brand"
					size="compact-xs"
					leftSection={copied ? <Check size={14} /> : <Copy size={14} />}
					onClick={() => void handleCopy()}
				>
					{copied ? 'Скопировано' : 'Копировать'}
				</Button>
			</Group>
		</Box>
	);
};
