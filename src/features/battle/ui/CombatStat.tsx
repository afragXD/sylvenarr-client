import { Text } from '@mantine/core';
import { Gauge, Heart, HeartOff, Layers, Shield, Sword, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import styles from './CombatStat.module.css';

type CombatStatKind = 'health' | 'damage' | 'armor' | 'initiative' | 'level' | 'fallen';

const META: Record<CombatStatKind, { Icon: LucideIcon; label: string }> = {
	health: { Icon: Heart, label: 'ОЗ' },
	damage: { Icon: Sword, label: 'Урон' },
	armor: { Icon: Shield, label: 'Броня' },
	initiative: { Icon: Gauge, label: 'Инициатива' },
	level: { Icon: Layers, label: 'Ур.' },
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
 * Стат боя: иконка + значение (без текстовой метки в UI).
 */
export const CombatStat = ({
	kind,
	value,
	size = 12,
	textSize = 'xs',
	muted = false,
}: CombatStatProps) => {
	const { Icon, label } = META[kind];
	return (
		<span
			className={`${styles.stat}${kind === 'fallen' ? ` ${styles.fallen}` : ''}`}
			title={label}
			aria-label={value !== undefined && value !== null ? `${label}: ${String(value)}` : label}
		>
			<Icon className={styles.icon} size={size} strokeWidth={2} aria-hidden />
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
