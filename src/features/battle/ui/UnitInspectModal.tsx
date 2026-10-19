import { Group, Modal, SimpleGrid, Stack, Text } from '@mantine/core';
import {
	Coins,
	Crosshair,
	Clover,
	Gauge,
	Ghost,
	Heart,
	Shield,
	ShieldBan,
	Sparkles,
	Sword,
	WandSparkles,
	Zap,
	type LucideIcon,
} from 'lucide-react';

import {
	formatAbilityPreview,
	getAbilityPreview,
	getHeroAbilities,
	HeroImage,
	previewCtxFromUnit,
} from '@/entities/hero';
import type { BattleUnit } from '@/entities/match';

import { describeResist, formatResistValue } from '../model/resistMeta';

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
	| 'ultaCharges'
	| 'morale';

const STATS: ReadonlyArray<{
	key: NumericStatKey;
	label: string;
	hint: string;
	Icon?: LucideIcon;
}> = [
	{ key: 'lvl', label: 'Уровень', hint: 'Сила приростов и способностей' },
	{ key: 'health', label: 'ОЗ', hint: 'Запас жизни', Icon: Heart },
	{ key: 'damage', label: 'Урон', hint: 'Сила обычной атаки', Icon: Sword },
	{ key: 'armor', label: 'Броня', hint: 'Снижает входящий урон', Icon: Shield },
	{ key: 'initiative', label: 'Инициатива', hint: 'Порядок хода в раунде', Icon: Gauge },
	{ key: 'dodge', label: 'Уклонение', hint: 'Шанс избежать удара', Icon: Sparkles },
	{ key: 'luck', label: 'Удача', hint: 'Критические и особые броски', Icon: Clover },
	{ key: 'accuracy', label: 'Точность', hint: 'Шанс попасть по цели', Icon: Crosshair },
	{ key: 'power', label: 'Сила магии', hint: 'Мощность заклинаний', Icon: WandSparkles },
	{ key: 'mana', label: 'Мана', hint: 'Ресурс для способностей', Icon: Zap },
	{ key: 'gold', label: 'Золото', hint: 'Трофеи юнита', Icon: Coins },
	{ key: 'critBank', label: 'Крит-банк', hint: 'Накопленный критический запас', Icon: Sword },
	{ key: 'ultaCharges', label: 'Заряды', hint: 'Заряды ультимативной способности', Icon: Sparkles },
	{ key: 'morale', label: 'Мораль', hint: 'Боевой дух (каталожный показатель)', Icon: Ghost },
];

function formatMorale(value: number): string {
	return value > 0 ? `+${value}` : String(value);
}

/**
 * Инспектор юнита в бою: live-статы, эффекты, описание способностей.
 */
export const UnitInspectModal = ({ unit, onClose }: UnitInspectModalProps) => {
	const doc = unit ? getHeroAbilities(unit.heroClassCode, true) : null;
	const previewCtx = unit ? previewCtxFromUnit(unit) : null;
	const passivePreview =
		unit && previewCtx
			? formatAbilityPreview(getAbilityPreview(unit.heroClassCode, 'passive', previewCtx))
			: null;

	return (
		<Modal
			opened={Boolean(unit)}
			onClose={onClose}
			title={unit?.displayName ?? ''}
			size="lg"
			centered
			radius={0}
		>
			{unit && doc && previewCtx && (
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
						{(unit.effects?.length ?? 0) > 0 || (unit.resists?.length ?? 0) > 0 ? (
							<div className={styles.effects}>
								<UnitEffects
									effects={unit.effects ?? []}
									resists={unit.resists ?? []}
									variant="inline"
								/>
							</div>
						) : null}
						</div>
					</Group>

					<SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
						{STATS.map((stat) => {
							const value = unit[stat.key];
							const Icon = stat.Icon;
							const display =
								stat.key === 'morale' && typeof value === 'number'
									? formatMorale(value)
									: typeof value === 'number'
										? value
										: '—';
							return (
								<div
									key={stat.key}
									className={`sylvenarr-stat-cell ${styles.stat}`}
									aria-label={`${stat.label}: ${display}. ${stat.hint}`}
								>
									<span className={`sylvenarr-stat-cell__label ${styles.statLabel}`}>
										{Icon ? <Icon size={11} strokeWidth={2} aria-hidden /> : null}
										{stat.label}
									</span>
									<span className={`sylvenarr-stat-cell__value ${styles.statValue}`}>
										{display}
									</span>
									<span className={styles.statHint}>{stat.hint}</span>
								</div>
							);
						})}
					</SimpleGrid>

					<div className={styles.block}>
						<Text size="sm" fw={600} mb={6}>
							Сопротивления
						</Text>
						{(unit.resists?.length ?? 0) > 0 ? (
							<div className={styles.resistGrid}>
								{(unit.resists ?? []).map((resist) => (
									<div
										key={resist.source}
										className={styles.resist}
										aria-label={`${resist.label}: ${formatResistValue(resist)}. ${describeResist(resist)}`}
										title={describeResist(resist)}
									>
										<ShieldBan size={12} strokeWidth={2} aria-hidden />
										<Text size="xs" c="var(--app-text-muted)">
											{resist.label}
										</Text>
										<Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
											{formatResistValue(resist)}
										</Text>
										<Text size="xs" c="var(--app-text-muted)" className={styles.resistHint}>
											{describeResist(resist)}
										</Text>
									</div>
								))}
							</div>
						) : (
							<Text size="sm" c="var(--app-text-muted)">
								Нет особых сопротивлений
							</Text>
						)}
					</div>

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
							{passivePreview ? (
								<Text
									size="xs"
									c="var(--app-text-muted)"
									mt={4}
									style={{ fontVariantNumeric: 'tabular-nums' }}
								>
									{passivePreview}
								</Text>
							) : null}
						</div>
					)}

					{doc.slots.map((slot) => {
						const preview = formatAbilityPreview(
							getAbilityPreview(unit.heroClassCode, slot.slot, previewCtx),
						);
						return (
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
								{preview ? (
									<Text
										size="xs"
										c="var(--app-text-muted)"
										mt={4}
										style={{ fontVariantNumeric: 'tabular-nums' }}
									>
										{preview}
									</Text>
								) : null}
							</div>
						);
					})}
				</Stack>
			)}
		</Modal>
	);
};
