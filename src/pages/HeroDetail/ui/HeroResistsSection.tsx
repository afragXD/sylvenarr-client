import { Group, Stack, Text } from '@mantine/core';
import { ShieldBan } from 'lucide-react';

import { formatBaseResistValue, getHeroBaseResists } from '@/entities/hero';

type HeroResistsSectionProps = {
	code: string;
};

/**
 * Базовые сопротивления и варды класса (зеркало defaultResists.ts).
 */
export const HeroResistsSection = ({ code }: HeroResistsSectionProps) => {
	const resists = getHeroBaseResists(code);
	if (resists.length === 0) {
		return null;
	}
	return (
		<Stack gap={8}>
			<Text size="sm" fw={600}>
				Сопротивления и варды
			</Text>
			<Group gap={8} wrap="wrap">
				{resists.map((resist) => (
					<Group
						key={resist.source}
						gap={6}
						wrap="nowrap"
						className="sylvenarr-stat-cell"
						title={`${resist.label}: ${formatBaseResistValue(resist)}`}
					>
						<ShieldBan size={12} strokeWidth={2} aria-hidden />
						<Text size="xs" c="var(--app-text-muted)">
							{resist.label}
						</Text>
						<Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
							{formatBaseResistValue(resist)}
						</Text>
					</Group>
				))}
			</Group>
		</Stack>
	);
};
