import { Text, Tooltip } from '@mantine/core';
import { Gauge, Heart, HeartOff, Shield, Sword, Zap, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import styles from './CombatStat.module.css';

type CombatStatKind = 'health' | 'damage' | 'armor' | 'initiative' | 'level' | 'fallen' | 'mana';

const META: Record<
	CombatStatKind,
	{ label: string; hint: string; Icon?: LucideIcon; abbrev?: string }
> = {
	health: { Icon: Heart, label: 'ОЗ', hint: 'Запас жизни' },
	damage: { Icon: Sword, label: 'Урон', hint: 'Сила обычной атаки' },
	armor: { Icon: Shield, label: 'Броня', hint: 'Снижает входящий урон' },
	initiative: { Icon: Gauge, label: 'Инициатива', hint: 'Порядок хода в раунде' },
	// Как Lv./Ур. в RPG — текст читается однозначнее любой иконки.
	level: { label: 'Уровень', abbrev: 'Ур.', hint: 'Сила приростов и способностей' },
	fallen: { Icon: HeartOff, label: 'Пал', hint: 'Юнит повержен' },
	mana: { Icon: Zap, label: 'Мана', hint: 'Ресурс для способностей' },
};

type CombatStatProps = {
	kind: CombatStatKind;
	value?: ReactNode;
	size?: number;
	textSize?: 'xs' | 'sm';
	muted?: boolean;
};

/**
 * Стат боя: иконка (или краткая метка) + значение; подсказка по hover/focus (AC-5).
 */
export const CombatStat = ({
	kind,
	value,
	size = 14,
	textSize = 'sm',
	muted = false,
}: CombatStatProps) => {
	const { Icon, label, abbrev, hint } = META[kind];
	const aria =
		value !== undefined && value !== null ? `${label}: ${String(value)}. ${hint}` : `${label}. ${hint}`;
	const body = (
		<span
			className={`${styles.stat}${kind === 'fallen' ? ` ${styles.fallen}` : ''}`}
			tabIndex={0}
			aria-label={aria}
		>
			{abbrev ? (
				<Text
					component="span"
					size={textSize}
					fw={600}
					c={muted ? 'var(--app-text-muted)' : undefined}
					aria-hidden
				>
					{abbrev}
				</Text>
			) : Icon ? (
				<Icon className={styles.icon} size={size} strokeWidth={2} aria-hidden />
			) : null}
			{value !== undefined && value !== null && (
				<Text
					component="span"
					size={textSize}
					c={muted ? 'var(--app-text-muted)' : undefined}
					style={{ fontVariantNumeric: 'tabular-nums', fontSize: textSize === 'sm' ? 14 : undefined }}
				>
					{value}
				</Text>
			)}
		</span>
	);
	return (
		<Tooltip
			label={`${label} — ${hint}`}
			withArrow
			events={{ hover: true, focus: true, touch: true }}
		>
			{body}
		</Tooltip>
	);
};

type CombatStatRowProps = {
	children: ReactNode;
	className?: string;
};

/** Горизонтальный ряд статов. */
export const CombatStatRow = ({ children, className }: CombatStatRowProps) => (
	<span className={[styles.row, className].filter(Boolean).join(' ')}>{children}</span>
);
