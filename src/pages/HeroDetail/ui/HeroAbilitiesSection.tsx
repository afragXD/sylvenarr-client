import { Anchor, Stack, Text, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { getHeroAbilities } from '@/entities/hero';

import styles from './HeroAbilitiesSection.module.css';

type HeroAbilitiesSectionProps = {
	code: string;
	isPlayable: boolean;
};

/**
 * Пассивка и слоты способностей на карточке героя.
 */
export const HeroAbilitiesSection = ({ code, isPlayable }: HeroAbilitiesSectionProps) => {
	const doc = getHeroAbilities(code, isPlayable);

	return (
		<Stack gap="md" className={styles.section} maw="42rem">
			<Title order={2} size="h3">
				Способности
			</Title>

			{doc.summonNote && (
				<Text size="sm" c="var(--app-text-muted)" style={{ lineHeight: 1.5 }}>
					{doc.summonNote}
				</Text>
			)}

			{doc.passive && (
				<div className={styles.entry}>
					<Text size="sm" fw={600}>
						Пассивка — {doc.passive.title}
					</Text>
					<Text size="sm" c="var(--app-text-muted)" style={{ lineHeight: 1.5 }}>
						{doc.passive.body}
					</Text>
				</div>
			)}

			{doc.slots.map((slot) => (
				<div key={slot.slot} className={styles.entry}>
					<Text size="sm" fw={600}>
						[{slot.slot}] {slot.title}
					</Text>
					<Text size="sm" c="var(--app-text-muted)" style={{ lineHeight: 1.5 }}>
						{slot.body}
					</Text>
				</div>
			))}

			<Anchor component={Link} to="/heroes/effects" size="sm" c="brand" w="fit-content">
				Все эффекты
			</Anchor>
		</Stack>
	);
};
