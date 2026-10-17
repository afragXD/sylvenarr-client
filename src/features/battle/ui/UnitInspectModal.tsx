import { Group, Modal, SimpleGrid, Stack, Text } from '@mantine/core';

import { getHeroAbilities, HeroImage } from '@/entities/hero';
import type { BattleUnit } from '@/entities/match';

import { AbilityTags } from './AbilityTags';
import { UnitEffects } from './UnitEffects';
import styles from './UnitInspectModal.module.css';

type UnitInspectModalProps = {
	unit: BattleUnit | null;
	onClose: () => void;
};

type NumericStatKey =
	| 'health'
	| 'damage'
	| 'armor'
	| 'initiative'
	| 'dodge'
	| 'luck'
	| 'accuracy'
	| 'power'
	| 'mana'
	| 'gold'
	| 'critBank'
	| 'ultaCharges';

const STATS: ReadonlyArray<{ key: NumericStatKey; label: string }> = [
	{ key: 'health', label: 'ОЗ' },
	{ key: 'damage', label: 'Урон' },
	{ key: 'armor', label: 'Броня' },
	{ key: 'initiative', label: 'Инициатива' },
	{ key: 'dodge', label: 'Уклонение' },
	{ key: 'luck', label: 'Удача' },
	{ key: 'accuracy', label: 'Точность' },
	{ key: 'power', label: 'Сила магии' },
	{ key: 'mana', label: 'Мана' },
	{ key: 'gold', label: 'Золото' },
	{ key: 'critBank', label: 'Крит-банк' },
	{ key: 'ultaCharges', label: 'Заряды' },
];

/**
 * Инспектор юнита в бою: live-статы, эффекты, описание способностей.
 */
export const UnitInspectModal = ({ unit, onClose }: UnitInspectModalProps) => {
	const doc = unit ? getHeroAbilities(unit.heroClassCode, true) : null;

	return (
		<Modal
			opened={Boolean(unit)}
			onClose={onClose}
			title={unit?.displayName ?? ''}
			size="lg"
			centered
		>
			{unit && doc && (
				<Stack gap="md">
					<Group gap="md" align="flex-start" wrap="nowrap">
						<HeroImage
							code={unit.heroClassCode}
							alt={unit.displayName}
							w={72}
							h={72}
							radius={0}
						/>
						<div>
							<Text size="sm" c="var(--app-text-muted)">
								{unit.heroClassCode}
								{unit.isSummon ? ' · саммон' : ''}
								{unit.defending ? ' · защита' : ''}
								{!unit.alive ? ' · пал' : ''}
							</Text>
							<Text size="sm" mt={4}>
								ОЗ {unit.health}/{unit.maxHp} · ряд {unit.row + 1}
							</Text>
							<div className={styles.effects}>
								<UnitEffects effects={unit.effects ?? []} />
							</div>
						</div>
					</Group>

					<SimpleGrid cols={{ base: 3, sm: 4 }} spacing="xs">
						{STATS.map((stat) => {
							const value = unit[stat.key];
							return (
								<div key={stat.key} className={styles.stat}>
									<Text size="xs" c="var(--app-text-muted)">
										{stat.label}
									</Text>
									<Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
										{typeof value === 'number' ? value : '—'}
									</Text>
								</div>
							);
						})}
					</SimpleGrid>

					{doc.passive && (
						<div className={styles.block}>
							<Text size="sm" fw={600}>
								Пассивка — {doc.passive.title}
							</Text>
							<Text size="sm" c="var(--app-text-muted)">
								{doc.passive.body}
							</Text>
							{doc.passive.mechanics && (
								<Text size="xs" c="var(--app-text-muted)" mt={4}>
									{doc.passive.mechanics}
								</Text>
							)}
						</div>
					)}

					{doc.slots.map((slot) => (
						<div key={slot.slot} className={styles.block}>
							<Group gap={8} wrap="nowrap">
								<AbilityTags tags={slot.tags} />
								<Text size="sm" fw={600}>
									[{slot.slot}] {slot.title}
								</Text>
							</Group>
							<Text size="sm" c="var(--app-text-muted)">
								{slot.body}
							</Text>
							<Text size="xs" c="var(--app-text-muted)" mt={4}>
								{slot.mechanics}
							</Text>
						</div>
					))}
				</Stack>
			)}
		</Modal>
	);
};
