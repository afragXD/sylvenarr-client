import { Button } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';

import type { BattleUnit, FairSummary } from '@/entities/match';
import { ItemGlyph } from '@/shared/ui/ItemGlyph';

import styles from './BattleFair.module.css';

type BattleFairBarProps = {
	readonly fair: FairSummary;
	readonly units: readonly BattleUnit[];
	readonly hostGold: number;
	readonly guestGold: number;
	readonly myTeam: 0 | 1;
	readonly isMyTurn: boolean;
	readonly busy: boolean;
	readonly hostName: string;
	readonly guestName: string;
	readonly onBuy: (itemCode: number) => void;
	readonly onSell: (itemCode: number) => void;
	readonly onSellAll: () => void;
	readonly onStop: () => void;
};

/**
 * Прилавок ярмарки: кошельки, очередь, товары, кнопки торговли.
 */
export function BattleFairBar({
	fair,
	units,
	hostGold,
	guestGold,
	myTeam,
	isMyTurn,
	busy,
	hostName,
	guestName,
	onBuy,
	onSell,
	onSellAll,
	onStop,
}: BattleFairBarProps) {
	const [selectedShop, setSelectedShop] = useState<number | null>(null);
	const [selectedSell, setSelectedSell] = useState<number | null>(null);
	const [fly, setFly] = useState<{ code: number; category: number; tier: number } | null>(null);
	const prevShopRef = useRef(fair.shop.map((s) => s.code).join(','));

	const turnName =
		fair.turnTeam === 0
			? (units.find((u) => u.id === fair.traderIds[0])?.displayName ?? hostName)
			: (units.find((u) => u.id === fair.traderIds[1])?.displayName ?? guestName);

	const myGold = myTeam === 0 ? hostGold : guestGold;
	const mySell = fair.sellByTeam[myTeam] ?? [];
	const selectedBuy = fair.shop.find((s) => s.code === selectedShop) ?? null;
	const canBuy = Boolean(isMyTurn && selectedBuy && myGold >= selectedBuy.buyPrice);
	const canSell = Boolean(isMyTurn && selectedSell != null);

	useEffect(() => {
		const key = fair.shop.map((s) => s.code).join(',');
		const prev = prevShopRef.current;
		prevShopRef.current = key;
		if (!prev || prev === key) {
			return;
		}
		const prevCodes = new Set(prev.split(',').filter(Boolean).map(Number));
		const bought = [...prevCodes].find((code) => !fair.shop.some((s) => s.code === code));
		if (bought == null) {
			return;
		}
		const reduced =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			return;
		}
		const entry = fair.shop.find((s) => s.code === bought);
		setFly({
			code: bought,
			category: entry?.category ?? 7,
			tier: entry?.tier ?? 1,
		});
		const t = window.setTimeout(() => setFly(null), 220);
		return () => window.clearTimeout(t);
	}, [fair.shop]);

	useEffect(() => {
		setSelectedShop(null);
		setSelectedSell(null);
	}, [fair.turnTeam, fair.index]);

	return (
		<>
			<div className={styles.bar} role="region" aria-label={`Ярмарка ${fair.index}`}>
				<div className={styles.wallets}>
					<span className={styles.walletSide} title={hostName}>
						{hostGold}
					</span>
					<p className={styles.turn}>Очередь: {turnName}</p>
					<span className={styles.walletSide} title={guestName}>
						{guestGold}
					</span>
				</div>

				{fair.shop.length === 0 ? (
					<p className={styles.turn}>Всё распродано</p>
				) : (
					<div className={styles.shop}>
						{fair.shop.map((item) => (
							<button
								key={`${item.code}-${item.buyPrice}`}
								type="button"
								className={`${styles.card}${selectedShop === item.code ? ` ${styles.cardSelected}` : ''}`}
								disabled={!isMyTurn || busy}
								title={item.description}
								onClick={() => {
									setSelectedShop(item.code);
									setSelectedSell(null);
								}}
							>
								<span className={styles.cardTop}>
									<ItemGlyph category={item.category} tier={item.tier} size={24} />
									<span className={styles.cardName}>{item.name}</span>
								</span>
								<span className={styles.price}>{item.buyPrice}</span>
							</button>
						))}
					</div>
				)}

				{mySell.length > 0 ? (
					<div className={styles.shop} aria-label="Ваши предметы на продажу">
						{mySell.map((item) => (
							<button
								key={`sell-${item.code}`}
								type="button"
								className={`${styles.card}${selectedSell === item.code ? ` ${styles.cardSelected}` : ''}`}
								disabled={!isMyTurn || busy}
								onClick={() => {
									setSelectedSell(item.code);
									setSelectedShop(null);
								}}
							>
								<span className={styles.cardName}>{item.name}</span>
								<span className={styles.price}>прод. {item.sellPrice}</span>
							</button>
						))}
					</div>
				) : null}

				<div className={styles.actions}>
					<Button
						color="accent"
						loading={busy}
						disabled={!canBuy}
						onClick={() => selectedBuy && onBuy(selectedBuy.code)}
					>
						Купить за {selectedBuy ? selectedBuy.buyPrice : 'N'}
					</Button>
					<Button
						variant="light"
						color="accent"
						loading={busy}
						disabled={!canSell}
						onClick={() => selectedSell != null && onSell(selectedSell)}
					>
						Продать за{' '}
						{selectedSell != null
							? (mySell.find((s) => s.code === selectedSell)?.sellPrice ?? 'N')
							: 'N'}
					</Button>
					<Button
						variant="light"
						color="brand"
						loading={busy}
						disabled={!isMyTurn}
						onClick={onSellAll}
					>
						Продать всё
					</Button>
					<Button variant="default" loading={busy} disabled={!isMyTurn} onClick={onStop}>
						Закончить торги
					</Button>
				</div>
			</div>
			{fly ? (
				<span
					className={styles.fly}
					style={{
						left: '50%',
						top: '60%',
						transform: myTeam === 0 ? 'translate(-120%, -40%)' : 'translate(20%, -40%)',
					}}
				>
					<ItemGlyph category={fly.category} tier={fly.tier} size={32} />
				</span>
			) : null}
		</>
	);
}

export { styles as battleFairStyles };
