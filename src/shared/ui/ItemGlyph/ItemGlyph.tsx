import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

import { getItemIconUrl, tierRarity, tierRarityTitle } from '@/entities/item';

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
	/** Код предмета — если задан, показываем WebP с сервера (fallback на букву). */
	readonly code?: number;
	readonly quantity?: number;
	readonly size?: number;
	readonly title?: string;
};

/**
 * Иконка предмета: WebP по `code`, иначе глиф категории + насечки тира.
 */
export function ItemGlyph({ category, tier, code, quantity, size = 40, title }: ItemGlyphProps) {
	const [imgFailed, setImgFailed] = useState(false);
	useEffect(() => {
		setImgFailed(false);
	}, [code]);
	const mark = CATEGORY_MARK[category] ?? String(category);
	const notches = Math.max(1, Math.min(9, Math.round(tier)));
	const rarity = tierRarity(tier);
	const rarityTitle = tierRarityTitle(tier);
	const tip = title ? `${title}. ${rarityTitle}` : rarityTitle;
	const showImage = typeof code === 'number' && Number.isFinite(code) && !imgFailed;

	const style: CSSProperties & { '--item-rarity'?: string } = {
		width: size,
		height: size,
		fontSize: size * 0.32,
	};
	if (!showImage && rarity.color) {
		style['--item-rarity'] = rarity.color;
	}

	return (
		<span
			className={`${styles.glyph}${showImage ? ` ${styles.glyphArt}` : ''}`}
			style={style}
			title={tip}
			aria-hidden={title ? undefined : true}
		>
			{showImage ? (
				<img
					className={styles.art}
					src={getItemIconUrl(code)}
					alt=""
					draggable={false}
					onError={() => setImgFailed(true)}
				/>
			) : (
				<>
					<span className={styles.mark}>{mark}</span>
					<span className={styles.notches} aria-hidden>
						{Array.from({ length: notches }, (_, i) => (
							<span key={i} className={styles.notch} />
						))}
					</span>
				</>
			)}
			{typeof quantity === 'number' && quantity > 1 ? (
				<span className={styles.qty}>{quantity}</span>
			) : null}
		</span>
	);
}
