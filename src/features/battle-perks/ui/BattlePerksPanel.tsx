import { Button } from '@mantine/core';

import type { BattleUnit, PerkOffer } from '@/entities/match';
import { PerkGlyph } from '@/shared/ui/PerkGlyph';

import styles from './BattlePerks.module.css';

function formatBattleUnitLabel(unit: BattleUnit, units: readonly BattleUnit[]): string {
	const place = `${unit.row === 0 ? 'П' : 'З'}${unit.column + 1}`;
	if (!unit.isSummon) {
		return `${unit.displayName} (${place})`;
	}
	const summoner = units.find((item) => item.id === unit.summonerId);
	const owner = summoner
		? ` — саммон ${summoner.displayName} (${summoner.row === 0 ? 'П' : 'З'}${summoner.column + 1})`
		: '';
	return `✦ ${unit.displayName} (${place})${owner}`;
}

type BattlePerksPanelProps = {
	readonly offers: readonly PerkOffer[];
	readonly units: readonly BattleUnit[];
	readonly playerId: string;
	readonly busy: boolean;
	readonly onPick: (unitId: string, perkId: string) => void;
	readonly onSkip: (unitId: string) => void;
};

/**
 * Выбор перка: свои предложения; иначе ожидание соперника.
 */
export function BattlePerksPanel({
	offers,
	units,
	playerId,
	busy,
	onPick,
	onSkip,
}: BattlePerksPanelProps) {
	const mine = offers.filter((o) => o.playerId === playerId && !o.done);
	const current = mine[0] ?? null;
	const unit = current ? units.find((u) => u.id === current.unitId) : null;
	const heroLabel = unit ? formatBattleUnitLabel(unit, units) : '';

	if (!current || !unit) {
		return (
			<div className={styles.overlay} role="status">
				<p className={styles.wait}>Соперник выбирает перки</p>
			</div>
		);
	}

	return (
		<div className={styles.overlay} role="dialog" aria-label="Выбор перка">
			<p className={styles.hero}>{heroLabel}</p>
			<div className={styles.options}>
				{current.options.map((option) => (
					<button
						key={option.id}
						type="button"
						className={styles.option}
						disabled={busy || option.learned}
						onClick={() => onPick(current.unitId, option.id)}
						title={option.learned ? 'Уже изучен' : option.description}
					>
						<span className={styles.optionHead}>
							<PerkGlyph perkId={option.id} size={32} title={option.name} />
							<span className={styles.optionName}>
								{option.name}
								{option.learned ? ' (изучен)' : ''}
							</span>
						</span>
						<span className={styles.optionDesc}>{option.description}</span>
					</button>
				))}
			</div>
			<div className={styles.actions}>
				<Button variant="default" loading={busy} onClick={() => onSkip(current.unitId)}>
					Пропустить (+1 уровень)
				</Button>
			</div>
		</div>
	);
}
