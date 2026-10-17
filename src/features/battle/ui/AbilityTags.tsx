import { Tooltip } from '@mantine/core';
import {
	Crosshair,
	Heart,
	Skull,
	Sparkles,
	Sword,
	Users,
	type LucideIcon,
} from 'lucide-react';

import { ABILITY_TAG_LABELS, type AbilityTag } from '@/entities/hero/model/abilityTags';

import styles from './AbilityTags.module.css';

const ICONS: Record<AbilityTag, LucideIcon> = {
	buff: Sparkles,
	debuff: Skull,
	attack: Sword,
	aoe: Crosshair,
	heal: Heart,
	summon: Users,
};

type AbilityTagsProps = {
	tags: AbilityTag[];
	size?: number;
};

/**
 * Иконки-теги способности (бафф / атака / AoE…).
 */
export const AbilityTags = ({ tags, size = 14 }: AbilityTagsProps) => {
	if (tags.length === 0) {
		return null;
	}
	return (
		<span className={styles.row}>
			{tags.map((tag) => {
				const Icon = ICONS[tag];
				return (
					<Tooltip key={tag} label={ABILITY_TAG_LABELS[tag]} withArrow>
						<span className={styles.tag} data-tag={tag}>
							<Icon size={size} strokeWidth={2} aria-label={ABILITY_TAG_LABELS[tag]} />
						</span>
					</Tooltip>
				);
			})}
		</span>
	);
};
