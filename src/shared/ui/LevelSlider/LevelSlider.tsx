import { Slider } from '@mantine/core';

import styles from './LevelSlider.module.css';

/** Как стартовый уровень в лобби (MATCH_RULES_LIMITS.startingLevel). */
export const LEVEL_SLIDER_DEFAULTS = {
	min: 1,
	max: 30,
	step: 1,
} as const;

export type LevelMark = { value: number; label: string };

/**
 * Метки: min, max и промежутки с шагом `interval` (по умолчанию 5).
 * Для 1–30 → 1 · 5 · 10 · 15 · 20 · 25 · 30.
 */
export function buildLevelMarks(
	min: number,
	max: number,
	interval = 5,
): LevelMark[] {
	const values = new Set<number>([min, max]);
	const start = Math.ceil(min / interval) * interval;
	for (let value = start; value < max; value += interval) {
		if (value > min) {
			values.add(value);
		}
	}
	return [...values]
		.sort((a, b) => a - b)
		.map((value) => ({ value, label: String(value) }));
}

export type LevelSliderProps = {
	value: number;
	onChange: (value: number) => void;
	label?: string;
	min?: number;
	max?: number;
	step?: number;
	marks?: LevelMark[];
	className?: string;
};

/**
 * Ползунок уровня в стиле лобби: подпись + [slider | число].
 */
export const LevelSlider = ({
	value,
	onChange,
	label = 'Уровень',
	min = LEVEL_SLIDER_DEFAULTS.min,
	max = LEVEL_SLIDER_DEFAULTS.max,
	step = LEVEL_SLIDER_DEFAULTS.step,
	marks,
	className,
}: LevelSliderProps) => {
	const resolvedMarks = marks ?? buildLevelMarks(min, max);
	return (
		<div className={[styles.field, className].filter(Boolean).join(' ')}>
			{label ? <span className={styles.label}>{label}</span> : null}
			<div className={styles.row}>
				<Slider
					style={{ flex: 1 }}
					min={min}
					max={max}
					step={step}
					value={value}
					onChange={onChange}
					label={null}
					marks={resolvedMarks}
				/>
				<span className={styles.value}>{value}</span>
			</div>
		</div>
	);
};
