import { useReducedMotion } from '@mantine/hooks';
import { useEffect, useState } from 'react';

import styles from './PresetNamesBanner.module.css';

type PresetCallsignProps = {
	/** Ник игрока — рядом с названием пресета (AC-13 п.20). */
	playerName: string;
	presetName: string | null | undefined;
	/** Показывать только в начале боя (fighting, early). */
	active: boolean;
	/** Выравнивание под сторону поля (host слева / guest справа). */
	align?: 'start' | 'end';
};

/**
 * CUT AC-13 п.20: название пресета у ника стороны, 5 с видно, затем растворение 1 с.
 */
export const PresetCallsign = ({
	playerName,
	presetName,
	active,
	align = 'start',
}: PresetCallsignProps) => {
	const reduceMotion = useReducedMotion();
	const [phase, setPhase] = useState<'show' | 'fade' | 'gone'>('show');

	useEffect(() => {
		if (!active || !presetName) {
			setPhase('gone');
			return;
		}
		setPhase('show');
		const noMotion = Boolean(reduceMotion);
		const fadeAt = window.setTimeout(() => {
			setPhase(noMotion ? 'gone' : 'fade');
		}, 5000);
		const goneAt = window.setTimeout(
			() => {
				setPhase('gone');
			},
			noMotion ? 5000 : 6000,
		);
		return () => {
			window.clearTimeout(fadeAt);
			window.clearTimeout(goneAt);
		};
	}, [active, presetName, reduceMotion]);

	if (phase === 'gone' || !presetName) {
		return null;
	}

	return (
		<div
			className={styles.callsign}
			data-phase={phase}
			data-align={align}
			aria-live="polite"
		>
			<span className={styles.nick}>{playerName}</span>
			<span className={styles.preset}>{presetName}</span>
		</div>
	);
};
