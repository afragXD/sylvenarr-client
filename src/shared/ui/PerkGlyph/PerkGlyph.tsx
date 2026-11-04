import type { CSSProperties } from 'react';

import { perkGlyphMeta, perkName } from '@/entities/item';

import styles from './PerkGlyph.module.css';

type PerkGlyphProps = {
	readonly perkId: string;
	readonly size?: number;
	readonly title?: string;
};

/**
 * Глиф перка: буква категории предметов или метка прочего навыка.
 */
export function PerkGlyph({ perkId, size = 28, title }: PerkGlyphProps) {
	const meta = perkGlyphMeta(perkId);
	const label = title ?? perkName(perkId);
	const style: CSSProperties = {
		width: size,
		height: size,
		fontSize: size * (meta.mark.length > 1 ? 0.28 : 0.34),
	};
	return (
		<span
			className={styles.glyph}
			style={style}
			data-kind={meta.kind}
			title={label}
			aria-label={label}
		>
			<span className={styles.mark}>{meta.mark}</span>
		</span>
	);
}
