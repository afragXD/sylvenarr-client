import { Stack, Text, Tooltip } from '@mantine/core';
import type { BattleEffectBrief } from '@/entities/match';

import { formatEffectRounds, getEffectMeta, MAX_VISIBLE_EFFECTS } from '../model/effectMeta';

import styles from './BattlePanel.module.css';

type UnitEffectsProps = {
	effects: BattleEffectBrief[];
};

/**
 * Компактная полоса эффектов на юните: до 4 иконок + overflow +K.
 */
export const UnitEffects = ({ effects }: UnitEffectsProps) => {
	if (effects.length === 0) {
		return null;
	}

	const visible = effects.slice(0, MAX_VISIBLE_EFFECTS);
	const hidden = effects.slice(MAX_VISIBLE_EFFECTS);

	return (
		<div className={styles.effects}>
			{visible.map((effect) => (
				<EffectBadge key={effect.id} effect={effect} />
			))}
			{hidden.length > 0 && <OverflowBadge effects={hidden} />}
		</div>
	);
};

const EffectBadge = ({ effect }: { effect: BattleEffectBrief }) => {
	const meta = getEffectMeta(effect.id);
	const roundsLabel = formatEffectRounds(effect.rounds);
	const Icon = meta.Icon;

	return (
		<Tooltip
			multiline
			w={220}
			withArrow
			label={
				<Stack gap={4}>
					<Text size="sm" fw={600}>
						{meta.label}
					</Text>
					<Text size="xs">{meta.description}</Text>
					{typeof effect.power === 'number' && effect.power !== 0 && (
						<Text size="xs" c="dimmed">
							Сила: {effect.power}
						</Text>
					)}
					{roundsLabel && (
						<Text size="xs" c="dimmed">
							{roundsLabel}
						</Text>
					)}
				</Stack>
			}
		>
			<span className={styles.effectTag} data-kind={meta.kind}>
				<Icon size={12} strokeWidth={2} aria-hidden />
				{effect.rounds > 0 ? <span className={styles.effectRounds}>{effect.rounds}</span> : null}
			</span>
		</Tooltip>
	);
};

const OverflowBadge = ({ effects }: { effects: BattleEffectBrief[] }) => (
	<Tooltip
		multiline
		w={240}
		withArrow
		label={
			<Stack gap={4}>
				{effects.map((effect) => {
					const meta = getEffectMeta(effect.id);
					const roundsLabel = formatEffectRounds(effect.rounds);
					const line = roundsLabel ? `${meta.label} · ${roundsLabel.toLowerCase()}` : meta.label;
					return (
						<Text key={effect.id} size="xs">
							{line}
						</Text>
					);
				})}
			</Stack>
		}
	>
		<span className={styles.effectOverflow}>+{effects.length}</span>
	</Tooltip>
);
