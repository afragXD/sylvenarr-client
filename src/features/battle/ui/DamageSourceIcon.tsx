import { Shield } from 'lucide-react';

import { getDamageSourceIcon } from '../model/damageSourceMeta';

import styles from './DamageSourceIcon.module.css';

type ElementIconProps = {
	source: string;
	size?: number;
	strokeWidth?: number;
	className?: string;
};

/** Только иконка стихии/источника (для %-сопротивлений). */
export const ElementIcon = ({
	source,
	size = 12,
	strokeWidth = 2,
	className,
}: ElementIconProps) => {
	const Icon = getDamageSourceIcon(source);
	return <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden />;
};

type WardIconProps = {
	source: string;
	/** Внешний размер щита. */
	size?: number;
	strokeWidth?: number;
	className?: string;
};

/**
 * Вард: контур щита с иконкой стихии поверх (не emoji).
 */
export const WardIcon = ({ source, size = 14, strokeWidth = 2, className }: WardIconProps) => {
	const Element = getDamageSourceIcon(source);
	const inner = Math.max(6, Math.round(size * 0.5));
	return (
		<span className={`${styles.wardIcon}${className ? ` ${className}` : ''}`} style={{ width: size, height: size }}>
			<Shield size={size} strokeWidth={strokeWidth} className={styles.wardShield} aria-hidden />
			<Element size={inner} strokeWidth={strokeWidth} className={styles.wardElement} aria-hidden />
		</span>
	);
};
