import { ActionIcon, Slider, Tooltip } from '@mantine/core';
import { Volume1, Volume2, VolumeX } from 'lucide-react';

import { setBattleSfxMuted, setBattleSfxVolume, useBattleSfxSettings } from '../lib/battleSfx';
import styles from './BattleSoundControl.module.css';

/**
 * Звук боя: выключение и громкость (хранится в браузере).
 */
export const BattleSoundControl = () => {
	const { muted, volume } = useBattleSfxSettings();
	const silent = muted || volume === 0;
	const Icon = silent ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
	const percent = Math.round(volume * 100);

	return (
		<div className={styles.root}>
			<Tooltip label={silent ? 'Включить звук' : 'Выключить звук'} withArrow>
				<ActionIcon
					variant="subtle"
					color="brand"
					size="md"
					aria-label={silent ? 'Включить звук боя' : 'Выключить звук боя'}
					aria-pressed={silent}
					onClick={() => {
						if (silent && volume === 0) {
							setBattleSfxVolume(0.5);
						} else {
							setBattleSfxMuted(!muted);
						}
					}}
				>
					<Icon size={18} strokeWidth={1.75} />
				</ActionIcon>
			</Tooltip>
			<Slider
				className={styles.slider}
				data-silent={silent ? 'true' : undefined}
				size="xs"
				color="brand"
				radius={0}
				min={0}
				max={100}
				step={5}
				value={muted ? 0 : percent}
				label={(value) => `${value}%`}
				onChange={(value) => setBattleSfxVolume(value / 100)}
				aria-label="Громкость звука боя"
			/>
		</div>
	);
};
