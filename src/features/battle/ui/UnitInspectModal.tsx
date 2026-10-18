import { Group, Modal, SimpleGrid, Stack, Text } from '@mantine/core';
import {
	Coins,
	Crosshair,
	Clover,
	Gauge,
	Heart,
	Layers,
	Shield,
	ShieldBan,
	Sparkles,
	Sword,
	WandSparkles,
	Zap,
	type LucideIcon,
} from 'lucide-react';

import { getHeroAbilities, HeroImage } from '@/entities/hero';
import type { BattleUnit, ResistBrief } from '@/entities/match';

import { AbilityTags } from './AbilityTags';
import { CombatStat, CombatStatRow } from './CombatStat';
import { UnitEffects } from './UnitEffects';
import styles from './UnitInspectModal.module.css';

type UnitInspectModalProps = {
	unit: BattleUnit | null;
	onClose: () => void;
};

type NumericStatKey =
	| 'lvl'
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

const STATS: ReadonlyArray<{ key: NumericStatKey; label: string; Icon: LucideIcon }> = [
	{ key: 'lvl', label: 'Уровень', Icon: Layers },
	{ key: 'health', label: 'ОЗ', Icon: Heart },
	{ key: 'damage', label: 'Урон', Icon: Sword },
	{ key: 'armor', label: 'Броня', Icon: Shield },
	{ key: 'initiative', label: 'Инициатива', Icon: Gauge },
	{ key: 'dodge', label: 'Уклонение', Icon: Sparkles },
	{ key: 'luck', label: 'Удача', Icon: Clover },
	{ key: 'accuracy', label: 'Точность', Icon: Crosshair },
	{ key: 'power', label: 'Сила магии', Icon: WandSparkles },
	{ key: 'mana', label: 'Мана', Icon: Zap },
	{ key: 'gold', label: 'Золото', Icon: Coins },
	{ key: 'critBank', label: 'Крит-банк', Icon: Sword },
	{ key: 'ultaCharges', label: 'Заряды', Icon: Sparkles },
];

function formatResistValue(resist: ResistBrief): string {
	if (resist.immune) {
		return 'Иммунитет';
	}
	if (resist.wardCharges != null && resist.wardCharges > 0) {
		return resist.value !== 0 ? `${resist.value}% · Щит×${resist.wardCharges}` : 'Щит';
	}
	return `${resist.value}%`;
}

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
							<Group gap={6} wrap="wrap">
								<Text size="sm" c="var(--app-text-muted)">
									{unit.heroClassCode}
									{unit.isSummon ? ' · саммон' : ''}
									{unit.defending ? ' · защита' : ''}
								</Text>
								{!unit.alive ? <CombatStat kind="fallen" size={14} /> : null}
							</Group>
							<CombatStatRow>
								<CombatStat
									kind="health"
									value={`${unit.health}/${unit.maxHp}`}
									size={14}
									textSize="sm"
								/>
								<Text size="sm" c="var(--app-text-muted)">
									ряд {unit.row + 1}
								</Text>
							</CombatStatRow>
							<div className={styles.effects}>
								<UnitEffects effects={unit.effects ?? []} />
							</div>
						</div>
					</Group>

					<SimpleGrid cols={{ base: 3, sm: 4 }} spacing="xs">
						{STATS.map((stat) => {
							const value = unit[stat.key];
							const Icon = stat.Icon;
							return (
								<div
									key={stat.key}
									className={styles.stat}
									title={stat.label}
									aria-label={`${stat.label}: ${typeof value === 'number' ? value : '—'}`}
								>
									<Icon size={12} strokeWidth={2} aria-hidden />
									<Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
										{typeof value === 'number' ? value : '—'}
									</Text>
								</div>
							);
						})}
					</SimpleGrid>

					{(unit.resists?.length ?? 0) > 0 && (
						<div className={styles.block}>
							<Text size="sm" fw={600} mb={6}>
								Сопротивления
							</Text>
							<div className={styles.resistGrid}>
								{(unit.resists ?? []).map((resist) => (
									<div
										key={resist.source}
										className={styles.resist}
										title={resist.label}
										aria-label={`${resist.label}: ${formatResistValue(resist)}`}
									>
										<ShieldBan size={12} strokeWidth={2} aria-hidden />
										<Text size="xs" c="var(--app-text-muted)">
											{resist.label}
										</Text>
										<Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
											{formatResistValue(resist)}
										</Text>
									</div>
								))}
							</div>
						</div>
					)}

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
