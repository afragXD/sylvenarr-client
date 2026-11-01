import { useEffect, useState } from 'react';

import styles from './PresetNamesBanner.module.css';

type PresetNamesBannerProps = {
	hostName: string;
	guestName: string;
	hostPresetName: string | null | undefined;
	guestPresetName: string | null | undefined;
	/** Показывать только в начале боя (fighting, early). */
	active: boolean;
};

/**
 * CUT AC-13 п.20: названия пресетов рядом с никами, 5 с видимы, затем растворение 1 с.
 */
export const PresetNamesBanner = ({
	hostName,
	guestName,
	hostPresetName,
	guestPresetName,
	active,
}: PresetNamesBannerProps) => {
	const [phase, setPhase] = useState<'show' | 'fade' | 'gone'>('show');

	useEffect(() => {
		if (!active || (!hostPresetName && !guestPresetName)) {
			setPhase('gone');
			return;
		}
		setPhase('show');
		const reduceMotion =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const fadeAt = window.setTimeout(() => {
			setPhase(reduceMotion ? 'gone' : 'fade');
		}, 5000);
		const goneAt = window.setTimeout(() => {
			setPhase('gone');
		}, reduceMotion ? 5000 : 6000);
		return () => {
			window.clearTimeout(fadeAt);
			window.clearTimeout(goneAt);
		};
	}, [active, hostPresetName, guestPresetName]);

	if (phase === 'gone' || (!hostPresetName && !guestPresetName)) {
		return null;
	}

	return (
		<div className={styles.banner} data-phase={phase} aria-live="polite">
			{hostPresetName ? (
				<div className={styles.line}>
					<span className={styles.nick}>{hostName}</span>
					<span className={styles.preset}>{hostPresetName}</span>
				</div>
			) : null}
			{guestPresetName ? (
				<div className={styles.line}>
					<span className={styles.nick}>{guestName}</span>
					<span className={styles.preset}>{guestPresetName}</span>
				</div>
			) : null}
		</div>
	);
};
