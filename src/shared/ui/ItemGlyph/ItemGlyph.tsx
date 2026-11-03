import styles from './ItemGlyph.module.css';

const CATEGORY_MARK: Record<number, string> = {
	1: 'Т',
	2: 'Х',
	3: 'Сф',
	4: 'Св',
	5: 'Р',
	6: 'А',
	7: 'Рс',
	8: 'П',
	9: 'В',
};

type ItemGlyphProps = {
	readonly category: number;
	readonly tier: number;
	readonly quantity?: number;
	readonly size?: number;
	readonly title?: string;
};

/**
 * Приглушённый глиф категории предмета + насечки тира (CUT-2026-11-03b T15).
 */
export function ItemGlyph({ category, tier, quantity, size = 28, title }: ItemGlyphProps) {
	const mark = CATEGORY_MARK[category] ?? String(category);
	const notches = Math.max(1, Math.min(9, Math.round(tier)));
	return (
		<span
			className={styles.glyph}
			style={{ width: size, height: size, fontSize: size * 0.32 }}
			title={title}
			aria-hidden={title ? undefined : true}
		>
			<span className={styles.mark}>{mark}</span>
			<span className={styles.notches} aria-hidden>
				{Array.from({ length: notches }, (_, i) => (
					<span key={i} className={styles.notch} />
				))}
			</span>
			{typeof quantity === 'number' && quantity > 1 ? (
				<span className={styles.qty}>{quantity}</span>
			) : null}
		</span>
	);
}
