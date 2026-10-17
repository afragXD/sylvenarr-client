import { Text } from '@mantine/core';

import { HeroImage } from '@/entities/hero';
import type { TurnOrderEntry } from '@/entities/match';

import styles from './TurnOrderStrip.module.css';

type TurnOrderStripProps = {
	entries: TurnOrderEntry[];
};

/**
 * Полоса очереди хода (референс DOS2 / BG3).
 */
export const TurnOrderStrip = ({ entries }: TurnOrderStripProps) => {
	if (entries.length === 0) {
		return null;
	}
	return (
		<div className={styles.strip} aria-label="Очередь хода">
			<Text size="xs" c="var(--app-text-muted)" className={styles.label}>
				Очередь
			</Text>
			<div className={styles.track}>
				{entries.map((entry) => (
					<div
						key={entry.unitId}
						className={styles.portrait}
						data-active={entry.isActive ? 'true' : undefined}
						data-dead={entry.alive ? undefined : 'true'}
						data-team={entry.team}
						title={entry.displayName}
					>
						<HeroImage
							code={entry.heroClassCode}
							alt={entry.displayName}
							w={entry.isActive ? 44 : 36}
							h={entry.isActive ? 44 : 36}
							radius={0}
						/>
					</div>
				))}
			</div>
		</div>
	);
};
