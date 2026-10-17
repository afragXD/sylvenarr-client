import { Button, Group, Stack, Text, Tooltip } from '@mantine/core';
import { useState } from 'react';
import { HeroImage } from '@/entities/hero';
import type { AbilityInfo, BattleState, BattleUnit, Match } from '@/entities/match';

import styles from './BattlePanel.module.css';
import { UnitEffects } from './UnitEffects';

type BattleActionKind = 'attack' | 'defend' | 'wait' | 'skill' | 'ability';

type BattlePanelProps = {
	match: Match;
	playerId: string;
	busy: boolean;
	onAction: (input: {
		unitId: string;
		action: BattleActionKind;
		targetId?: string;
		slot?: 1 | 2 | 3 | 4 | 5;
		choice?: string;
	}) => void;
};

type PendingMode =
	| { kind: 'attack' }
	| { kind: 'skill' }
	| { kind: 'ability'; slot: 1 | 2 | 3 | 4 | 5 }
	| null;

/**
 * Поле боя: два фланга, слоты 1–5 для пилотов, multi-step prompt.
 */
export const BattlePanel = ({ match, playerId, busy, onAction }: BattlePanelProps) => {
	const battle = match.battle;
	const [pendingMode, setPendingMode] = useState<PendingMode>(null);

	if (!battle) {
		return <Text c="var(--app-text-muted)">Загрузка боя…</Text>;
	}

	const isMyTurn = battle.turnPlayerId === playerId && battle.outcome === 'ongoing';
	const active = battle.units.find((unit) => unit.id === battle.activeUnitId) ?? null;
	const hostUnits = battle.units.filter((unit) => unit.team === 0);
	const guestUnits = battle.units.filter((unit) => unit.team === 1);
	const abilities = battle.abilities ?? [];
	const isPilot = abilities.length > 0;
	const skillLabel = battle.skillLabel;
	const skillNeedsTarget = (battle.legalSkillTargetIds?.length ?? 0) > 0;
	const prompt = battle.pendingPrompt;

	const highlightTargets = (() => {
		if (!pendingMode) {
			return [];
		}
		if (pendingMode.kind === 'attack') {
			return battle.legalTargetIds;
		}
		if (pendingMode.kind === 'skill') {
			return battle.legalSkillTargetIds ?? [];
		}
		const ability = abilities.find((item) => item.slot === pendingMode.slot);
		return ability?.legalTargetIds ?? [];
	})();

	const handleAttackClick = () => {
		if (!active || !isMyTurn || prompt) {
			return;
		}
		if (battle.legalTargetIds.length === 1) {
			onAction({ unitId: active.id, action: 'attack', targetId: battle.legalTargetIds[0] });
			setPendingMode(null);
			return;
		}
		setPendingMode({ kind: 'attack' });
	};

	const handleSkillClick = () => {
		if (!active || !isMyTurn || !skillLabel || prompt) {
			return;
		}
		if (!skillNeedsTarget) {
			onAction({ unitId: active.id, action: 'skill' });
			setPendingMode(null);
			return;
		}
		if (battle.legalSkillTargetIds.length === 1) {
			onAction({
				unitId: active.id,
				action: 'skill',
				targetId: battle.legalSkillTargetIds[0],
			});
			setPendingMode(null);
			return;
		}
		setPendingMode({ kind: 'skill' });
	};

	const handleAbilityClick = (ability: AbilityInfo) => {
		if (!active || !isMyTurn || prompt || ability.disabledReason) {
			return;
		}
		if (!ability.needsTarget) {
			onAction({ unitId: active.id, action: 'ability', slot: ability.slot });
			setPendingMode(null);
			return;
		}
		if (ability.legalTargetIds.length === 1) {
			onAction({
				unitId: active.id,
				action: 'ability',
				slot: ability.slot,
				targetId: ability.legalTargetIds[0],
			});
			setPendingMode(null);
			return;
		}
		setPendingMode({ kind: 'ability', slot: ability.slot });
	};

	const handleUnitClick = (unit: BattleUnit) => {
		if (!pendingMode || !active || !isMyTurn || prompt) {
			return;
		}
		if (!highlightTargets.includes(unit.id)) {
			return;
		}
		if (pendingMode.kind === 'ability') {
			onAction({
				unitId: active.id,
				action: 'ability',
				slot: pendingMode.slot,
				targetId: unit.id,
			});
		} else {
			onAction({ unitId: active.id, action: pendingMode.kind, targetId: unit.id });
		}
		setPendingMode(null);
	};

	const handlePromptChoice = (choiceId: string) => {
		if (!active || !isMyTurn || !prompt) {
			return;
		}
		onAction({
			unitId: active.id,
			action: 'ability',
			slot: prompt.slot,
			choice: choiceId,
		});
		setPendingMode(null);
	};

	return (
		<div className={styles.panel}>
			<Group justify="space-between" wrap="wrap">
				<Text fw={600}>
					Раунд {battle.stage}
					{battle.outcome === 'ongoing' ? (isMyTurn ? ' · ваш ход' : ' · ход соперника') : ''}
				</Text>
				{active && battle.outcome === 'ongoing' && (
					<Text size="sm" c="var(--app-text-muted)">
						Ходит: {active.displayName}
						{typeof active.mana === 'number' && active.mana > 0 ? ` · МР ${active.mana}` : ''}
					</Text>
				)}
			</Group>

			<div className={styles.field}>
				<TeamSide
					title={`Игрок 1 · ${match.host.displayName}`}
					units={hostUnits}
					mirror
					activeId={battle.activeUnitId}
					legalTargets={highlightTargets}
					onUnitClick={handleUnitClick}
				/>
				<TeamSide
					title={`Игрок 2 · ${match.guest?.displayName ?? '…'}`}
					units={guestUnits}
					mirror={false}
					activeId={battle.activeUnitId}
					legalTargets={highlightTargets}
					onUnitClick={handleUnitClick}
				/>
			</div>

			{battle.outcome === 'ongoing' && isMyTurn && active && prompt && (
				<div className={styles.prompt}>
					<Text size="sm" fw={600} mb={6}>
						Выберите вариант
					</Text>
					<div className={styles.actions}>
						{prompt.options.map((option) => (
							<Button
								key={option.id}
								color="accent"
								loading={busy}
								onClick={() => handlePromptChoice(option.id)}
							>
								{option.label}
							</Button>
						))}
					</div>
				</div>
			)}

			{battle.outcome === 'ongoing' && isMyTurn && active && !prompt && (
				<div className={styles.actions}>
					{isPilot ? (
						abilities.map((ability) => {
							const selecting =
								pendingMode?.kind === 'ability' && pendingMode.slot === ability.slot;
							const button = (
								<Button
									key={ability.slot}
									variant={ability.slot === 1 ? 'filled' : 'light'}
									color="accent"
									loading={busy}
									disabled={Boolean(ability.disabledReason)}
									onClick={() => handleAbilityClick(ability)}
								>
									[{ability.slot}] {ability.label}
									{selecting ? ' — цель' : ''}
								</Button>
							);
							return ability.disabledReason ? (
								<Tooltip key={ability.slot} label={ability.disabledReason}>
									<span>{button}</span>
								</Tooltip>
							) : (
								button
							);
						})
					) : (
						<>
							<Button
								color="accent"
								loading={busy}
								onClick={handleAttackClick}
								disabled={battle.legalTargetIds.length === 0}
							>
								Атака
								{pendingMode?.kind === 'attack' ? ' — выберите цель' : ''}
							</Button>
							{skillLabel && (
								<Button
									variant="light"
									color="accent"
									loading={busy}
									onClick={handleSkillClick}
									disabled={skillNeedsTarget && battle.legalSkillTargetIds.length === 0}
								>
									{skillLabel}
									{pendingMode?.kind === 'skill' ? ' — выберите цель' : ''}
								</Button>
							)}
						</>
					)}
					<Button
						variant="light"
						color="brand"
						loading={busy}
						onClick={() => {
							setPendingMode(null);
							onAction({ unitId: active.id, action: 'defend' });
						}}
					>
						Защита
					</Button>
					<Button
						variant="default"
						loading={busy}
						onClick={() => {
							setPendingMode(null);
							onAction({ unitId: active.id, action: 'wait' });
						}}
					>
						Ждать
					</Button>
				</div>
			)}

			{battle.outcome !== 'ongoing' && (
				<Stack gap={4}>
					<Text fw={700} c="accent">
						{outcomeLabel(battle, playerId)}
					</Text>
				</Stack>
			)}

			<div className={styles.log} aria-live="polite">
				{battle.log.map((line, index) => (
					<div key={`${index}-${line}`}>{line}</div>
				))}
			</div>
		</div>
	);
};

const TeamSide = ({
	title,
	units,
	mirror,
	activeId,
	legalTargets,
	onUnitClick,
}: {
	title: string;
	units: BattleUnit[];
	mirror: boolean;
	activeId: string | null;
	legalTargets: string[];
	onUnitClick: (unit: BattleUnit) => void;
}) => {
	const front = units.filter((unit) => unit.row === 0);
	const back = units.filter((unit) => unit.row === 1);
	const left = mirror ? back : front;
	const right = mirror ? front : back;
	const leftLabel = mirror ? 'Задний ряд' : 'Передний ряд';
	const rightLabel = mirror ? 'Передний ряд' : 'Задний ряд';

	return (
		<div className={styles.side}>
			<div className={styles.sideTitle}>{title}</div>
			<div className={styles.rows}>
				<RowColumn
					label={leftLabel}
					units={left}
					activeId={activeId}
					legalTargets={legalTargets}
					onUnitClick={onUnitClick}
				/>
				<RowColumn
					label={rightLabel}
					units={right}
					activeId={activeId}
					legalTargets={legalTargets}
					onUnitClick={onUnitClick}
				/>
			</div>
		</div>
	);
};

const RowColumn = ({
	label,
	units,
	activeId,
	legalTargets,
	onUnitClick,
}: {
	label: string;
	units: BattleUnit[];
	activeId: string | null;
	legalTargets: string[];
	onUnitClick: (unit: BattleUnit) => void;
}) => (
	<div>
		<Text size="xs" c="var(--app-text-muted)" mb={4}>
			{label}
		</Text>
		<div className={styles.row}>
			{units.length === 0 ? (
				<Text size="sm" c="var(--app-text-muted)">
					—
				</Text>
			) : (
				units.map((unit) => (
					<button
						key={unit.id}
						type="button"
						className={styles.unit}
						data-active={unit.id === activeId ? 'true' : undefined}
						data-target={legalTargets.includes(unit.id) ? 'true' : undefined}
						data-dead={unit.alive ? undefined : 'true'}
						data-summon={unit.isSummon ? 'true' : undefined}
						onClick={() => onUnitClick(unit)}
					>
						<Group gap={6} wrap="nowrap">
							<HeroImage
								code={unit.heroClassCode}
								alt={unit.displayName}
								w={28}
								h={28}
								radius={0}
							/>
							<Text size="sm" lineClamp={1}>
								{unit.isSummon ? '✦ ' : ''}
								{unit.displayName}
								{unit.defending ? ' 🛡' : ''}
								{unit.horseIsDead ? ' ✗конь' : ''}
							</Text>
						</Group>
						<Text className={styles.hp}>
							{unit.health}/{unit.maxHp}
						</Text>
						<UnitEffects effects={unit.effects ?? []} />
					</button>
				))
			)}
		</div>
	</div>
);

const outcomeLabel = (battle: BattleState, playerId: string): string => {
	if (battle.outcome === 'draw') {
		return 'Ничья.';
	}
	if (battle.winnerPlayerId === playerId) {
		return 'Победа!';
	}
	return 'Поражение.';
};
