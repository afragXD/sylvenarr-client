import { useEffect, useRef, useState } from 'react';

import styles from './TeamWallet.module.css';

type TeamWalletProps = {
	readonly gold: number;
};

/**
 * Счётчик золота отряда у заголовка стороны.
 * При изменении на 1 с показывает «+N» / «−N» (без анимации при prefers-reduced-motion).
 */
export function TeamWallet({ gold }: TeamWalletProps) {
	const prevRef = useRef(gold);
	const [delta, setDelta] = useState<number | null>(null);

	useEffect(() => {
		const prev = prevRef.current;
		prevRef.current = gold;
		if (prev === gold) {
			return;
		}
		const diff = gold - prev;
		setDelta(diff);
		const reduced =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			setDelta(null);
			return;
		}
		const timer = window.setTimeout(() => setDelta(null), 1000);
		return () => window.clearTimeout(timer);
	}, [gold]);

	return (
		<span className={styles.wallet} title="Золото отряда">
			<span className={styles.amount}>{gold}</span>
			{delta !== null && delta !== 0 ? (
				<span className={delta > 0 ? styles.deltaUp : styles.deltaDown} aria-live="polite">
					{delta > 0 ? `+${delta}` : String(delta)}
				</span>
			) : null}
		</span>
	);
}
