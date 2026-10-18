import { Collapse, SegmentedControl, Slider, Stack, Switch, Text } from '@mantine/core';
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
	{ value: 'allow', label: 'Можно' },
	{ value: 'uniqueTeam', label: 'Не у себя' },
	{ value: 'uniqueMatch', label: 'В матче' },
];

const intSeg = (min: number, max: number) =>
	Array.from({ length: max - min + 1 }, (_, index) => {
		const value = String(min + index);
		return { value, label: value };
	});

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
						{['Перед', 'Зад'].map((label) => (
							<div key={label} className={styles.rowLine}>
								{Array.from({ length: rules.maxRowSize }, (_, index) => (
									<span key={index} className={styles.slot} title={label} />
								))}
							</div>
						))}
					</div>
				</div>
				<div className={styles.field}>
					<span className={styles.fieldLabel}>Дубли классов</span>
					<SegmentedControl
						fullWidth
						value={rules.heroDupes}
						onChange={(value) => patch({ heroDupes: value as HeroDupesMode })}
						data={HERO_DUPES_DATA}
					/>
					<Text size="sm" c="var(--app-text-muted)" style={{ lineHeight: 1.4 }}>
						Только набор отряда. Призывы и эволюции в бою не ограничиваются.
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
			</Stack>

			<div className={styles.fairBlock}>
				<p className={styles.sectionTitle}>Ярмарка · фаза 4.1</p>
				<Switch
					label="Ярмарка"
					description="Настройки сохраняются, в бою пока не используются"
					checked={rules.fairEnabled}
					onChange={(event) => patch({ fairEnabled: event.currentTarget.checked })}
				/>
				<Collapse expanded={rules.fairEnabled}>
					<Stack gap="sm" pt="sm">
						<div className={styles.field}>
							<span className={styles.fieldLabel}>Частота (раз в N раундов)</span>
							<div className={styles.sliderRow}>
								<Slider
									style={{ flex: 1 }}
									min={MATCH_RULES_LIMITS.fairFrequency.min}
									max={MATCH_RULES_LIMITS.fairFrequency.max}
									value={rules.fairFrequency}
									onChange={(value) => patch({ fairFrequency: value })}
								/>
								<span className={styles.sliderValue}>{rules.fairFrequency}</span>
							</div>
						</div>
						<div className={styles.field}>
							<span className={styles.fieldLabel}>Товаров в лавке</span>
							<div className={styles.sliderRow}>
								<Slider
									style={{ flex: 1 }}
									min={MATCH_RULES_LIMITS.shopSize.min}
									max={MATCH_RULES_LIMITS.shopSize.max}
									value={rules.shopSize}
									onChange={(value) => patch({ shopSize: value })}
								/>
								<span className={styles.sliderValue}>{rules.shopSize}</span>
							</div>
						</div>
						<div className={styles.field}>
							<span className={styles.fieldLabel}>Множитель золота</span>
							<div className={styles.sliderRow}>
								<Slider
									style={{ flex: 1 }}
									min={MATCH_RULES_LIMITS.goldBonus.min}
									max={MATCH_RULES_LIMITS.goldBonus.max}
									step={MATCH_RULES_LIMITS.goldBonus.step}
									value={rules.goldBonus}
									onChange={(value) => patch({ goldBonus: value })}
								/>
								<span className={styles.sliderValue}>×{rules.goldBonus}</span>
							</div>
						</div>
					</Stack>
				</Collapse>
			</div>
		</div>
	);
};
