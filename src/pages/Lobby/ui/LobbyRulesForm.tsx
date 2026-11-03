import { SegmentedControl, Slider, Stack, Switch, Text } from '@mantine/core';
import { useMemo } from 'react';

import {
	applyPreset,
	detectPreset,
	type HeroDupesMode,
	healthBonusToPercent,
	healthPercentToBonus,
	MATCH_RULES_LIMITS,
	type MatchRules,
	validateMatchRules,
} from '@/entities/match';
import { LevelSlider } from '@/shared/ui/LevelSlider';

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
 * Форма правил матча: пресеты, сегменты квот, слайдеры боя, ярмарка/перки/предметы.
 */
export const LobbyRulesForm = ({ rules, onChange }: LobbyRulesFormProps) => {
	const preset = detectPreset(rules);
	const validation = useMemo(() => validateMatchRules(rules), [rules]);
	const healthPercent = healthBonusToPercent(rules.healthBonus);

	const patch = (partial: Partial<MatchRules>) => {
		onChange({ ...rules, ...partial });
	};

	const setPreset = (value: string) => {
		if (value === 'custom') {
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
				<SegmentedControl fullWidth value={preset} onChange={setPreset} data={[...PRESET_DATA]} />
			</div>

			<div className={styles.field}>
				<Switch
					label="Товарищеский матч"
					description="Без изменения рейтинга (ПТС)"
					checked={!rules.rated}
					onChange={(event) => patch({ rated: !event.currentTarget.checked })}
				/>
			</div>

			<Stack gap={6}>
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

			<Stack gap={14}>
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
				<LevelSlider
					label="Стартовый уровень"
					min={MATCH_RULES_LIMITS.startingLevel.min}
					max={MATCH_RULES_LIMITS.startingLevel.max}
					step={MATCH_RULES_LIMITS.startingLevel.step}
					value={rules.startingLevel}
					onChange={(value) => patch({ startingLevel: value })}
				/>
			</Stack>

			<div className={styles.fairBlock}>
				<Switch
					label="Ярмарка, перки и предметы"
					description="Торговля между раундами, выбор перков, инвентарь отряда"
					checked={rules.fairEnabled}
					onChange={(event) => patch({ fairEnabled: event.currentTarget.checked })}
				/>
				{rules.fairEnabled && (
					<Stack gap={14} className={styles.fairSliders}>
						<div className={styles.field}>
							<span className={styles.fieldLabel}>Ярмарка раз в N раундов</span>
							<div className={styles.sliderRow}>
								<Slider
									style={{ flex: 1 }}
									min={MATCH_RULES_LIMITS.fairFrequency.min}
									max={MATCH_RULES_LIMITS.fairFrequency.max}
									step={1}
									value={rules.fairFrequency}
									onChange={(value) => patch({ fairFrequency: value })}
									marks={[
										{ value: 3, label: '3' },
										{ value: 5, label: '5' },
										{ value: 10, label: '10' },
									]}
								/>
								<span className={styles.sliderValue}>{rules.fairFrequency}</span>
							</div>
						</div>
						<div className={styles.field}>
							<span className={styles.fieldLabel}>Товаров на прилавке</span>
							<div className={styles.sliderRow}>
								<Slider
									style={{ flex: 1 }}
									min={MATCH_RULES_LIMITS.shopSize.min}
									max={MATCH_RULES_LIMITS.shopSize.max}
									step={1}
									value={rules.shopSize}
									onChange={(value) => patch({ shopSize: value })}
									marks={[
										{ value: 4, label: '4' },
										{ value: 8, label: '8' },
										{ value: 12, label: '12' },
									]}
								/>
								<span className={styles.sliderValue}>{rules.shopSize}</span>
							</div>
						</div>
						<div className={styles.field}>
							<span className={styles.fieldLabel}>Стартовое золото</span>
							<div className={styles.sliderRow}>
								<Slider
									style={{ flex: 1 }}
									min={MATCH_RULES_LIMITS.goldBonus.min}
									max={MATCH_RULES_LIMITS.goldBonus.max}
									step={MATCH_RULES_LIMITS.goldBonus.step}
									value={rules.goldBonus}
									onChange={(value) => patch({ goldBonus: value })}
									marks={[
										{ value: 0.5, label: '×0,5' },
										{ value: 1, label: '×1' },
										{ value: 2, label: '×2' },
									]}
								/>
								<span className={styles.sliderValue}>
									×{String(rules.goldBonus).replace('.', ',')}
								</span>
							</div>
						</div>
					</Stack>
				)}
			</div>
		</div>
	);
};
