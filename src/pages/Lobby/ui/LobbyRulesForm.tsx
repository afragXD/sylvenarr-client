import { SegmentedControl, Slider, Stack, Switch, Text } from '@mantine/core';
import { useMemo } from 'react';

import {
	MATCH_RULES_LIMITS,
	applyPreset,
	detectPreset,
	healthBonusToPercent,
	healthPercentToBonus,
	type HeroDupesMode,
	type MatchRules,
	validateMatchRules,
} from '@/entities/match';

import styles from './LobbyRulesForm.module.css';

type LobbyRulesFormProps = {
	rules: MatchRules;
	onChange: (next: MatchRules) => void;
};

const PRESET_DATA = [
	{ value: 'classic', label: 'Классика' },
	{ value: 'fast', label: 'Быстрый' },
	{ value: 'siege', label: 'Осада' },
	{ value: 'custom', label: 'Свой' },
] as const;

const HERO_DUPES_DATA: { value: HeroDupesMode; label: string }[] = [
	{ value: 'allow', label: 'Разрешён' },
	{ value: 'uniqueTeam', label: 'Один на отряд' },
	{ value: 'uniqueMatch', label: 'Один на матч' },
];

const intSeg = (min: number, max: number) =>
	Array.from({ length: max - min + 1 }, (_, index) => {
		const value = String(min + index);
		return { value, label: value };
	});

type RowColumnProps = {
	label: string;
	slotCount: number;
	front?: boolean;
};

const RowColumn = ({ label, slotCount, front = false }: RowColumnProps) => (
	<div className={styles.rowColumn}>
		<span className={styles.rowColumnLabel}>{label}</span>
		<div className={front ? `${styles.rowSlots} ${styles.rowSlotsFront}` : styles.rowSlots}>
			{Array.from({ length: slotCount }, (_, index) => (
				<span key={index} className={front ? `${styles.slot} ${styles.slotFront}` : styles.slot} />
			))}
		</div>
	</div>
);

type SidePreviewProps = {
	title: string;
	mirror: boolean;
	slotCount: number;
};

const SidePreview = ({ title, mirror, slotCount }: SidePreviewProps) => {
	const left = mirror ? (
		<RowColumn label="Зад" slotCount={slotCount} />
	) : (
		<RowColumn label="Перед" slotCount={slotCount} front />
	);
	const right = mirror ? (
		<RowColumn label="Перед" slotCount={slotCount} front />
	) : (
		<RowColumn label="Зад" slotCount={slotCount} />
	);

	return (
		<div className={styles.sidePreview}>
			<span className={styles.sideTitle}>{title}</span>
			<div className={styles.sideRows}>
				{left}
				{right}
			</div>
		</div>
	);
};

/**
 * Форма правил матча: пресеты, сегменты квот, слайдеры боя, заглушка ярмарки.
 */
export const LobbyRulesForm = ({ rules, onChange }: LobbyRulesFormProps) => {
	const preset = detectPreset(rules);
	const validation = useMemo(() => validateMatchRules(rules), [rules]);
	const healthPercent = healthBonusToPercent(rules.healthBonus);

	const patch = (partial: Partial<MatchRules>) => {
		onChange({ ...rules, ...partial });
	};

	const setPreset = (value: string) => {
		if (value === 'custom' || value === preset) {
			return;
		}
		if (value === 'classic' || value === 'fast' || value === 'siege') {
			onChange(applyPreset(value, rules));
		}
	};

	return (
		<div className={`sylvenarr-panel ${styles.panel}`}>
			<Stack gap={4}>
				<Text fw={650}>Правила матча</Text>
				<Text size="sm" c="var(--app-text-muted)" style={{ lineHeight: 1.45 }}>
					Влияют на этот матч. Последние значения запоминаются.
				</Text>
			</Stack>

			<div className={styles.field}>
				<span className={styles.fieldLabel}>Режим</span>
				<SegmentedControl
					fullWidth
					value={preset}
					onChange={setPreset}
					data={[...PRESET_DATA]}
				/>
			</div>

			<Stack gap="sm">
				<p className={styles.sectionTitle}>Отряд</p>
				<div className={styles.field}>
					<span className={styles.fieldLabel}>Стартовая квота</span>
					<SegmentedControl
						fullWidth
						value={String(rules.initialTeamSize)}
						onChange={(value) => patch({ initialTeamSize: Number(value) })}
						data={intSeg(
							MATCH_RULES_LIMITS.initialTeamSize.min,
							MATCH_RULES_LIMITS.initialTeamSize.max,
						)}
					/>
				</div>
				<div className={styles.field}>
					<span className={styles.fieldLabel}>Максимум команды</span>
					<SegmentedControl
						fullWidth
						value={String(rules.maxTeamSize)}
						onChange={(value) => patch({ maxTeamSize: Number(value) })}
						data={intSeg(MATCH_RULES_LIMITS.maxTeamSize.min, MATCH_RULES_LIMITS.maxTeamSize.max)}
					/>
				</div>
				<div className={styles.field}>
					<span className={styles.fieldLabel}>Юнитов в ряду</span>
					<SegmentedControl
						fullWidth
						value={String(rules.maxRowSize)}
						onChange={(value) => patch({ maxRowSize: Number(value) })}
						data={intSeg(MATCH_RULES_LIMITS.maxRowSize.min, MATCH_RULES_LIMITS.maxRowSize.max)}
					/>
					<div className={styles.rowsPreview} aria-hidden>
						<SidePreview title="Вы" mirror slotCount={rules.maxRowSize} />
						<SidePreview title="Соперник" mirror={false} slotCount={rules.maxRowSize} />
					</div>
				</div>
				<div className={styles.field}>
					<span className={styles.fieldLabel}>Повтор класса</span>
					<SegmentedControl
						fullWidth
						value={rules.heroDupes}
						onChange={(value) => patch({ heroDupes: value as HeroDupesMode })}
						data={HERO_DUPES_DATA}
					/>
					<Text size="sm" c="var(--app-text-muted)" style={{ lineHeight: 1.4 }}>
						Только при наборе отряда. Призывы и эволюции в бою не ограничиваются.
					</Text>
				</div>
				{!validation.ok && (
					<Text c="red" size="sm" role="alert">
						{validation.message}
					</Text>
				)}
			</Stack>

			<Stack gap="md">
				<p className={styles.sectionTitle}>Бой</p>
				<div className={styles.field}>
					<span className={styles.fieldLabel}>Стартовое здоровье</span>
					<div className={styles.sliderRow}>
						<Slider
							style={{ flex: 1 }}
							min={MATCH_RULES_LIMITS.healthPercent.min}
							max={MATCH_RULES_LIMITS.healthPercent.max}
							step={MATCH_RULES_LIMITS.healthPercent.step}
							value={healthPercent}
							onChange={(value) => patch({ healthBonus: healthPercentToBonus(value) })}
							marks={[
								{ value: 25, label: '25' },
								{ value: 50, label: '50' },
								{ value: 75, label: '75' },
								{ value: 100, label: '100' },
							]}
						/>
						<span className={styles.sliderValueAccent}>{healthPercent}%</span>
					</div>
				</div>
				<div className={styles.field}>
					<span className={styles.fieldLabel}>Лимит раундов</span>
					<div className={styles.sliderRow}>
						<Slider
							style={{ flex: 1 }}
							min={MATCH_RULES_LIMITS.maxRounds.min}
							max={MATCH_RULES_LIMITS.maxRounds.max}
							step={MATCH_RULES_LIMITS.maxRounds.step}
							value={rules.maxRounds}
							onChange={(value) => patch({ maxRounds: value })}
							marks={[
								{ value: 5, label: '5' },
								{ value: 20, label: '20' },
								{ value: 40, label: '40' },
							]}
						/>
						<span className={styles.sliderValue}>{rules.maxRounds}</span>
					</div>
				</div>
				<div className={styles.field}>
					<span className={styles.fieldLabel}>Стартовый уровень</span>
					<div className={styles.sliderRow}>
						<Slider
							style={{ flex: 1 }}
							min={MATCH_RULES_LIMITS.startingLevel.min}
							max={MATCH_RULES_LIMITS.startingLevel.max}
							step={MATCH_RULES_LIMITS.startingLevel.step}
							value={rules.startingLevel}
							onChange={(value) => patch({ startingLevel: value })}
							marks={[
								{ value: 1, label: '1' },
								{ value: 15, label: '15' },
								{ value: 30, label: '30' },
							]}
						/>
						<span className={styles.sliderValue}>{rules.startingLevel}</span>
					</div>
				</div>
			</Stack>

			<div className={styles.fairBlock}>
				<p className={styles.sectionTitle}>Ярмарка</p>
				<Switch label="Ярмарка" description="В разработке" checked={false} disabled />
			</div>
		</div>
	);
};
