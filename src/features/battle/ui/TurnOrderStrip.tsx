import { Text } from '@mantine/core';
import { useScrollIntoView } from '@mantine/hooks';
import { useEffect } from 'react';

import { HeroImage } from '@/entities/hero';
import type { TurnOrderEntry, TurnOrderPhase } from '@/entities/match';

import { PortraitHpCurtain } from './PortraitHpCurtain';
import styles from './TurnOrderStrip.module.css';

export type UnitHpSnapshot = {
	health: number;
	maxHp: number;
};

type TurnOrderStripProps = {
	entries: TurnOrderEntry[];
	stage: number;
	hpByUnitId?: ReadonlyMap<string, UnitHpSnapshot>;
	onSelectUnit?: (unitId: string) => void;
};

function resolvePhase(entry: TurnOrderEntry): TurnOrderPhase {
	if (entry.phase) {
		return entry.phase;
	}
	if (!entry.alive) {
		return 'dead';
	}
	if (entry.isActive) {
		return 'active';
	}
	return 'waiting';
}

function entryTitle(entry: TurnOrderEntry, phase: TurnOrderPhase): string {
	const lvlPart = typeof entry.lvl === 'number' ? ` · ур. ${entry.lvl}` : '';
	if (phase === 'delayed') {
		return `${entry.displayName}${lvlPart} · ожидает`;
	}
	if (phase === 'acted') {
		return `${entry.displayName}${lvlPart} · уже ходил`;
	}
	if (phase === 'active') {
		return `${entry.displayName}${lvlPart} · сейчас`;
	}
	if (phase === 'dead') {
		return `${entry.displayName}${lvlPart} · пал`;
	}
	return `${entry.displayName}${lvlPart}`;
}

/**
 * Шкала текущего раунда: ходившие → активный (playhead) → ожидающие.
 */
export const TurnOrderStrip = ({
	entries,
	stage,
	hpByUnitId,
	onSelectUnit,
}: TurnOrderStripProps) => {
	const reduceMotion =
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const { scrollIntoView, targetRef, scrollableRef } = useScrollIntoView<
		HTMLButtonElement,
		HTMLDivElement
	>({
		axis: 'x',
		duration: reduceMotion ? 0 : 280,
		offset: 48,
	});

	const activeId = entries.find((entry) => entry.isActive || entry.phase === 'active')?.unitId;

	useEffect(() => {
		if (!activeId) {
			return;
		}
		scrollIntoView({ alignment: 'center' });
	}, [activeId, scrollIntoView]);

	if (entries.length === 0) {
		return null;
	}

	return (
		<div className={styles.strip} aria-label={`Раунд ${stage}, очередь хода`}>
			<Text size="xs" c="var(--app-text-muted)" className={styles.label}>
				Раунд {stage}
			</Text>
			<div className={styles.trackWrap}>
				<div className={styles.axis} aria-hidden />
				<div ref={scrollableRef} className={styles.track}>
					{entries.map((entry) => {
						const phase = resolvePhase(entry);
						const isActive = phase === 'active' || entry.isActive;
						const interactive = entry.alive && Boolean(onSelectUnit);
						const size = isActive ? 44 : 36;
						const hp = hpByUnitId?.get(entry.unitId);
						const image = (
							<HeroImage
								code={entry.heroClassCode}
								alt={entry.displayName}
								w={size}
								h={size}
								radius={0}
							/>
						);
						return (
							<button
								key={entry.unitId}
								type="button"
								ref={isActive ? targetRef : undefined}
								className={styles.portrait}
								data-phase={phase}
								data-active={isActive ? 'true' : undefined}
								data-team={entry.team}
								title={entryTitle(entry, phase)}
								aria-current={isActive ? 'true' : undefined}
								aria-label={entryTitle(entry, phase)}
								disabled={!interactive}
								onClick={() => {
									if (interactive) {
										onSelectUnit?.(entry.unitId);
									}
								}}
							>
								{hp ? (
									<PortraitHpCurtain health={hp.health} maxHp={hp.maxHp}>
										{image}
									</PortraitHpCurtain>
								) : (
									image
								)}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
};
