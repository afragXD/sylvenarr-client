import { Text } from '@mantine/core';
import { Gauge, Heart, HeartOff, Shield, Sword, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import styles from './CombatStat.module.css';

type CombatStatKind = 'health' | 'damage' | 'armor' | 'initiative' | 'level' | 'fallen';

const META: Record<
	CombatStatKind,
	{ label: string; Icon?: LucideIcon; abbrev?: string }
> = {
	health: { Icon: Heart, label: 'ОЗ' },
	damage: { Icon: Sword, label: 'Урон' },
	armor: { Icon: Shield, label: 'Броня' },
	initiative: { Icon: Gauge, label: 'Инициатива' },
	// Как Lv./Ур. в RPG — текст читается однозначнее любой иконки.
	level: { label: 'Уровень', abbrev: 'Ур.' },
	fallen: { Icon: HeartOff, label: 'Пал' },
};

type CombatStatProps = {
	kind: CombatStatKind;
	value?: ReactNode;
	size?: number;
	textSize?: 'xs' | 'sm';
	muted?: boolean;
};

/**
 * Стат боя: иконка (или краткая метка) + значение.
 */
export const CombatStat = ({
	kind,
	value,
	size = 12,
	textSize = 'xs',
	muted = false,
}: CombatStatProps) => {
	const { Icon, label, abbrev } = META[kind];
	return (
		<span
			className={`${styles.stat}${kind === 'fallen' ? ` ${styles.fallen}` : ''}`}
			title={label}
			aria-label={value !== undefined && value !== null ? `${label}: ${String(value)}` : label}
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
					style={{ fontVariantNumeric: 'tabular-nums' }}
				>
					{value}
				</Text>
			)}
		</span>
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
