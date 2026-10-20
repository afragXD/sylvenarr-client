import { Group, Stack, Text } from '@mantine/core';

import {
	formatBaseResistPercent,
	formatBaseWardCharges,
	getHeroBaseResists,
	listBasePercentResists,
	listBaseWards,
} from '@/entities/hero';
import { ElementIcon, WardIcon } from '@/features/battle';

type HeroResistsSectionProps = {
	code: string;
};

/**
 * Базовые сопротивления и варды класса (зеркало defaultResists.ts) — отдельными группами.
 */
export const HeroResistsSection = ({ code }: HeroResistsSectionProps) => {
	const resists = getHeroBaseResists(code);
	if (resists.length === 0) {
		return null;
	}
	const wards = listBaseWards(resists);
	const percents = listBasePercentResists(resists);
	return (
		<Stack gap={10}>
			{wards.length > 0 ? (
				<Stack gap={8}>
					<Text size="sm" fw={600}>
						Варды
					</Text>
					<Group gap={8} wrap="wrap">
						{wards.map((resist) => {
							const charges = formatBaseWardCharges(resist);
							return (
								<Group
									key={`ward-${resist.source}`}
									gap={6}
									wrap="nowrap"
									className="sylvenarr-stat-cell"
									title={`Вард — ${resist.label}${charges ? `: ${charges}` : ''}`}
									aria-label={`Вард — ${resist.label}${charges ? ` · ${charges}` : ''}`}
								>
									<WardIcon source={resist.source} size={14} />
									<Text size="xs" c="var(--app-text-muted)">
										{resist.label}
									</Text>
									{charges ? (
										<Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
											{charges}
										</Text>
									) : null}
								</Group>
							);
						})}
					</Group>
				</Stack>
			) : null}
			{percents.length > 0 ? (
				<Stack gap={8}>
					<Text size="sm" fw={600}>
						Сопротивления
					</Text>
					<Group gap={8} wrap="wrap">
						{percents.map((resist) => {
							const percent = formatBaseResistPercent(resist);
							return (
								<Group
									key={`resist-${resist.source}`}
									gap={6}
									wrap="nowrap"
									className="sylvenarr-stat-cell"
									title={`${resist.label}: ${percent}`}
									aria-label={`${resist.label}: ${percent}`}
								>
									<ElementIcon source={resist.source} size={12} />
									<Text size="xs" c="var(--app-text-muted)">
										{resist.label}
									</Text>
									<Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
										{percent}
									</Text>
								</Group>
							);
						})}
					</Group>
				</Stack>
			) : null}
		</Stack>
	);
};
