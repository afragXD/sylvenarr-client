import { Button } from '@mantine/core';
import { useEffect, useMemo, useRef, useState } from 'react';

import { perkName, tierRarity } from '@/entities/item';
import type { BattleUnit, FairShopEntry, FairSummary } from '@/entities/match';
import { requiredPerkForCategory, teamHasItemPerk } from '@/features/battle-inventory';
import { ItemGlyph } from '@/shared/ui/ItemGlyph';
import { PerkGlyph } from '@/shared/ui/PerkGlyph';

import styles from './BattleFair.module.css';

type FlyItem = {
	readonly seq: number;
	readonly category: number;
	readonly tier: number;
	readonly buyerTeam: 0 | 1;
};

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
	const [fly, setFly] = useState<FlyItem | null>(null);
	const prevFairRef = useRef<{ index: number; turnTeam: 0 | 1; shop: FairShopEntry[] }>({
		index: fair.index,
		turnTeam: fair.turnTeam,
		shop: fair.shop,
	});
	const flySeqRef = useRef(0);

	const turnName =
		fair.turnTeam === 0
			? (units.find((u) => u.id === fair.traderIds[0])?.displayName ?? hostName)
			: (units.find((u) => u.id === fair.traderIds[1])?.displayName ?? guestName);

	const myGold = myTeam === 0 ? hostGold : guestGold;
	const traderGold = fair.turnTeam === 0 ? hostGold : guestGold;
	const mySell = fair.sellByTeam[myTeam] ?? [];
	const selectedBuy = fair.shop.find((s) => s.code === selectedShop) ?? null;
	const selectedSellEntry = mySell.find((s) => s.code === selectedSell) ?? null;
	const canBuy = Boolean(isMyTurn && selectedBuy && myGold >= selectedBuy.buyPrice);
	const canSell = Boolean(isMyTurn && selectedSellEntry);

	const myAllies = useMemo(
		() => units.filter((unit) => unit.team === myTeam && unit.alive && !unit.isSummon),
		[units, myTeam],
	);

	useEffect(() => {
		const prev = prevFairRef.current;
		prevFairRef.current = { index: fair.index, turnTeam: fair.turnTeam, shop: fair.shop };
		if (prev.index !== fair.index || prev.shop === fair.shop) {
			return;
		}
		const rest = [...fair.shop];
		const bought = prev.shop.find((entry) => {
			const at = rest.findIndex((s) => s.code === entry.code);
			if (at < 0) {
				return true;
			}
			rest.splice(at, 1);
			return false;
		});
		if (!bought) {
			return;
		}
		const reduced =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			return;
		}
		flySeqRef.current += 1;
		setFly({
			seq: flySeqRef.current,
			category: bought.category,
			tier: bought.tier,
			buyerTeam: prev.turnTeam,
		});
	}, [fair.index, fair.turnTeam, fair.shop]);

	useEffect(() => {
		if (!fly) {
			return;
		}
		const t = window.setTimeout(() => setFly(null), 260);
		return () => window.clearTimeout(t);
	}, [fly]);

	useEffect(() => {
		setSelectedShop(null);
		setSelectedSell(null);
	}, [fair.turnTeam, fair.index]);

	return (
		<>
			<section className={styles.bar} aria-label={`Ярмарка ${fair.index}`}>
				<div className={styles.wallets}>
					<span className={styles.walletSide} title={hostName}>
						{hostGold}
					</span>
					<p className={styles.turn}>Очередь: {turnName}</p>
					<span className={styles.walletSide} title={guestName}>
						{guestGold}
					</span>
				</div>

				{myAllies.length > 0 ? (
					<div className={styles.teamPerks} aria-label="Перки вашего отряда">
						<p className={styles.teamPerksTitle}>Перки отряда</p>
						<ul className={styles.teamPerksList}>
							{myAllies.map((unit) => (
								<li key={unit.id}>
									<span className={styles.teamPerksHero}>{unit.displayName}</span>
									<span className={styles.teamPerksValues}>
										{(unit.perks ?? []).length > 0
											? (unit.perks ?? []).map((id) => (
													<span key={id} className={styles.teamPerkChip}>
														<PerkGlyph perkId={id} size={16} />
														{perkName(id)}
													</span>
												))
											: '—'}
									</span>
								</li>
							))}
						</ul>
					</div>
				) : null}

				{fair.shop.length === 0 ? (
					<p className={styles.turn}>Всё распродано</p>
				) : (
					<div className={styles.shop}>
						{fair.shop.map((item) => {
							const rarity = tierRarity(item.tier);
							const rarityStyle = rarity.color ? { color: rarity.color } : undefined;
							const perk = requiredPerkForCategory(item.category);
							const hasTeamPerk = teamHasItemPerk(myAllies, item.category);
							const reason = !hasTeamPerk && perk ? `Нужен навык: ${perk.name}` : item.description;
							return (
								<button
									key={`${item.code}-${item.buyPrice}`}
									type="button"
									className={`${styles.card}${selectedShop === item.code ? ` ${styles.cardSelected}` : ''}${!hasTeamPerk ? ` ${styles.cardNoPerk}` : ''}`}
									disabled={!isMyTurn || busy}
									title={reason}
									onClick={() => {
										setSelectedShop(item.code);
										setSelectedSell(null);
									}}
								>
									<span className={styles.cardTop}>
										<ItemGlyph category={item.category} tier={item.tier} size={24} />
										<span className={styles.cardName} style={rarityStyle}>
											{item.name}
										</span>
									</span>
									<span
										className={`${styles.price}${traderGold < item.buyPrice ? ` ${styles.priceShort}` : ''}`}
									>
										{item.buyPrice}
									</span>
									{perk ? (
										<span
											className={`${styles.cardPerk}${!hasTeamPerk ? ` ${styles.cardPerkMissing}` : ''}`}
										>
											{hasTeamPerk ? perk.name : `Нужен: ${perk.name}`}
										</span>
									) : null}
								</button>
							);
						})}
					</div>
				)}

				{mySell.length > 0 ? (
					<fieldset
						className={`${styles.shop} ${styles.sellList}`}
						aria-label="Ваши предметы на продажу"
					>
						{mySell.map((item) => {
							const tier = Number(String(item.code)[0]);
							const rarity = tierRarity(tier);
							const rarityStyle = rarity.color ? { color: rarity.color } : undefined;
							return (
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
									<span className={styles.cardName} style={rarityStyle}>
										{item.name}
									</span>
									<span className={styles.price}>прод. {item.sellPrice}</span>
								</button>
							);
						})}
					</fieldset>
				) : null}

				<div className={styles.actions}>
					<Button
						color="accent"
						loading={busy}
						disabled={!canBuy}
						onClick={() => selectedBuy && onBuy(selectedBuy.code)}
					>
						{selectedBuy ? `Купить за ${selectedBuy.buyPrice}` : 'Купить'}
					</Button>
					<Button
						variant="light"
						color="accent"
						loading={busy}
						disabled={!canSell}
						onClick={() => selectedSellEntry && onSell(selectedSellEntry.code)}
					>
						{selectedSellEntry ? `Продать за ${selectedSellEntry.sellPrice}` : 'Продать'}
					</Button>
					<Button
						variant="light"
						color="brand"
						loading={busy}
						disabled={!isMyTurn || mySell.length === 0}
						onClick={onSellAll}
					>
						Продать всё
					</Button>
					<Button variant="default" loading={busy} disabled={!isMyTurn} onClick={onStop}>
						Закончить торги
					</Button>
				</div>
			</section>
			{fly ? (
				<span
					key={fly.seq}
					className={`${styles.fly} ${fly.buyerTeam === 0 ? styles.flyHost : styles.flyGuest}`}
					aria-hidden
					onAnimationEnd={() => setFly(null)}
				>
					<ItemGlyph category={fly.category} tier={fly.tier} size={32} />
				</span>
			) : null}
		</>
	);
}

export { styles as battleFairStyles };
