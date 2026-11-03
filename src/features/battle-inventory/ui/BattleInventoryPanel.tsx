import { Button } from '@mantine/core';

import { tierRarity } from '@/entities/item';
import type { BattleUnit, InventoryStack } from '@/entities/match';
import { ItemGlyph } from '@/shared/ui/ItemGlyph';

import { inventoryTotalCount } from '../lib/itemTargets';
import { requiredPerkForCategory, unitHasItemPerk } from '../model/itemPerks';
import styles from './BattleInventory.module.css';

type BattleInventoryPanelProps = {
	readonly inventory: readonly InventoryStack[];
	readonly actor: BattleUnit;
	readonly open: boolean;
	readonly selectedCode: number | null;
	readonly busy: boolean;
	readonly onToggle: () => void;
	readonly onSelect: (stack: InventoryStack) => void;
};

/**
 * Кнопка «Сумка (N)» и список предметов отряда.
 */
export function BattleInventoryPanel({
	inventory,
	actor,
	open,
	selectedCode,
	busy,
	onToggle,
	onSelect,
}: BattleInventoryPanelProps) {
	const total = inventoryTotalCount(inventory);
	return (
		<div className={styles.wrap}>
			<Button
				className={styles.bagBtn}
				variant={open ? 'filled' : 'light'}
				color="accent"
				loading={busy}
				onClick={onToggle}
			>
				Сумка ({total}){open && selectedCode != null ? ' — выберите цель' : open ? ' — выбор' : ''}
			</Button>
			{open ? (
				<div className={styles.panel} role="region" aria-label="Сумка отряда">
					<p className={styles.title}>Предметы отряда</p>
					{inventory.length === 0 ? (
						<p className={styles.empty}>Пусто</p>
					) : (
						<div className={styles.list}>
							{inventory.map((stack) => {
								const perk = requiredPerkForCategory(stack.category);
								const hasPerk = unitHasItemPerk(actor.perks, stack.category);
								const sellOnly = stack.target === 'sellOnly';
								const blocked = !hasPerk || sellOnly;
								const rarity = tierRarity(stack.tier);
								const reason = sellOnly
									? 'Только на продажу'
									: !hasPerk && perk
										? `Нужен навык: ${perk.name}`
										: stack.description;
								return (
									<button
										key={stack.code}
										type="button"
										className={`${styles.row}${selectedCode === stack.code ? ` ${styles.rowActive}` : ''}`}
										disabled={blocked || busy}
										onClick={() => onSelect(stack)}
										title={reason}
									>
										<ItemGlyph
											category={stack.category}
											tier={stack.tier}
											quantity={stack.quantity}
											title={stack.name}
										/>
										<span className={styles.meta}>
											<span
												className={styles.name}
												style={rarity.color ? { color: rarity.color } : undefined}
											>
												{stack.name}
											</span>
											<span className={styles.hint}>{reason}</span>
										</span>
									</button>
								);
							})}
						</div>
					)}
				</div>
			) : null}
		</div>
	);
}
