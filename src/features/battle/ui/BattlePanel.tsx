import { Button, Group, Stack, Text, Tooltip } from '@mantine/core';
import { useState } from 'react';

import { getHeroAbilities, HeroImage } from '@/entities/hero';
import type { AbilityInfo, BattleState, BattleUnit, Match } from '@/entities/match';

import { AbilityTags } from './AbilityTags';
import styles from './BattlePanel.module.css';
import { CombatStat, CombatStatRow } from './CombatStat';
import { TurnOrderStrip } from './TurnOrderStrip';
import { UnitEffects } from './UnitEffects';
import { UnitInspectModal } from './UnitInspectModal';

type BattleActionKind = 'attack' | 'defend' | 'wait' | 'skill' | 'ability' | 'move';

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

type ConfirmState = {
	title: string;
	detail: string;
	isAoe: boolean;
	payload: {
		unitId: string;
		action: BattleActionKind;
		targetId?: string;
		slot?: 1 | 2 | 3 | 4 | 5;
	};
};

/**
 * Поле боя: очередь, лог справа, слоты 1–5, подтверждение, инспектор.
 */
export const BattlePanel = ({ match, playerId, busy, onAction }: BattlePanelProps) => {
	const battle = match.battle;
	const [pendingMode, setPendingMode] = useState<PendingMode>(null);
	const [confirm, setConfirm] = useState<ConfirmState | null>(null);
	const [inspectUnit, setInspectUnit] = useState<BattleUnit | null>(null);

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
	const abilityDocs = active
		? getHeroAbilities(active.heroClassCode, true).slots
		: [];

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

	const openConfirm = (next: ConfirmState) => {
		setConfirm(next);
		setPendingMode(null);
	};

	const commitConfirm = () => {
		if (!confirm) {
			return;
		}
		onAction(confirm.payload);
		setConfirm(null);
	};

	/** Confirm-панель только для действий без цели (некого кликнуть на поле). */
	const requestAbilityNoTarget = (ability: AbilityInfo) => {
		if (!active) {
			return;
		}
		const doc = abilityDocs.find((slot) => slot.slot === ability.slot);
		const isAoe = Boolean(doc?.tags.includes('aoe'));
		openConfirm({
			title: ability.label,
			detail: isAoe
				? 'Действие затронет несколько целей или область.'
				: 'Подтвердите применение.',
			isAoe,
			payload: {
				unitId: active.id,
				action: 'ability',
				slot: ability.slot,
			},
		});
	};

	const castNow = (payload: ConfirmState['payload']) => {
		setPendingMode(null);
		setConfirm(null);
		onAction(payload);
	};

	const handleAttackClick = () => {
		if (!active || !isMyTurn || prompt) {
			return;
		}
		if (battle.legalTargetIds.length === 0) {
			return;
		}
		setPendingMode({ kind: 'attack' });
		setConfirm(null);
	};

	const handleSkillClick = () => {
		if (!active || !isMyTurn || !skillLabel || prompt) {
			return;
		}
		if (!skillNeedsTarget) {
			openConfirm({
				title: skillLabel,
				detail: 'Действие без выбора цели.',
				isAoe: true,
				payload: { unitId: active.id, action: 'skill' },
			});
			return;
		}
		setPendingMode({ kind: 'skill' });
		setConfirm(null);
	};

	const handleAbilityClick = (ability: AbilityInfo) => {
		if (!active || !isMyTurn || prompt || ability.disabledReason) {
			return;
		}
		if (!ability.needsTarget) {
			requestAbilityNoTarget(ability);
			return;
		}
		setPendingMode({ kind: 'ability', slot: ability.slot });
		setConfirm(null);
	};

	const handleUnitClick = (unit: BattleUnit) => {
		if (pendingMode && active && isMyTurn && !prompt && highlightTargets.includes(unit.id)) {
			if (pendingMode.kind === 'ability') {
				const ability = abilities.find((item) => item.slot === pendingMode.slot);
				if (ability) {
					castNow({
						unitId: active.id,
						action: 'ability',
						slot: ability.slot,
						targetId: unit.id,
					});
				}
			} else if (pendingMode.kind === 'attack') {
				castNow({ unitId: active.id, action: 'attack', targetId: unit.id });
			} else {
				castNow({ unitId: active.id, action: 'skill', targetId: unit.id });
			}
			return;
		}
		setInspectUnit(unit);
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
		setConfirm(null);
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

			<TurnOrderStrip
				entries={battle.turnOrder ?? []}
				stage={battle.stage}
				onSelectUnit={(unitId) => {
					const unit = battle.units.find((item) => item.id === unitId);
					if (unit) {
						setInspectUnit(unit);
					}
				}}
			/>

			<div className={styles.battlefield}>
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
				<div className={styles.log} aria-live="polite">
					<Text size="xs" c="var(--app-text-muted)" mb={6}>
						Журнал
					</Text>
					{battle.log.map((line, index) => (
						<div key={`${index}-${line}`}>{line}</div>
					))}
				</div>
			</div>

			{confirm && isMyTurn && (
				<div className={styles.confirm} data-aoe={confirm.isAoe ? 'true' : undefined}>
					<Text size="sm" fw={600}>
						{confirm.title}
					</Text>
					<Text size="sm" c="var(--app-text-muted)">
						{confirm.detail}
					</Text>
					<Group gap="sm" mt={8}>
						<Button color="accent" loading={busy} onClick={commitConfirm}>
							Подтвердить
						</Button>
						<Button
							variant="default"
							disabled={busy}
							onClick={() => setConfirm(null)}
						>
							Отмена
						</Button>
					</Group>
				</div>
			)}

			{battle.outcome === 'ongoing' && isMyTurn && active && prompt && (
				<div className={styles.prompt}>
					<Text size="sm" fw={600} mb={6}>
						{prompt.kind === 'lich_final_form'
							? 'Выберите финальную форму'
							: 'Выберите вариант'}
					</Text>
					<div className={styles.promptOptions}>
						{prompt.options.map((option) => (
							<div key={option.id} className={styles.promptOption}>
								<Button
									color="accent"
									loading={busy}
									onClick={() => handlePromptChoice(option.id)}
									fullWidth
								>
									{option.label}
								</Button>
								{option.description ? (
									<Text size="xs" c="var(--app-text-muted)" mt={4}>
										{option.description}
									</Text>
								) : null}
							</div>
						))}
					</div>
				</div>
			)}

			{battle.outcome === 'ongoing' && isMyTurn && active && !prompt && !confirm && (
				<div className={styles.actions}>
					{isPilot ? (
						abilities.map((ability) => {
							const selecting =
								pendingMode?.kind === 'ability' && pendingMode.slot === ability.slot;
							const doc = abilityDocs.find((slot) => slot.slot === ability.slot);
							const tip = ability.disabledReason
								? ability.disabledReason
								: doc
									? `${doc.title}: ${doc.body}\n${doc.mechanics}`
									: ability.label;
							const button = (
								<Button
									key={ability.slot}
									variant={ability.slot === 1 ? 'filled' : 'light'}
									color="accent"
									loading={busy}
									disabled={Boolean(ability.disabledReason)}
									onClick={() => handleAbilityClick(ability)}
									leftSection={doc ? <AbilityTags tags={doc.tags} size={12} /> : undefined}
								>
									[{ability.slot}] {ability.label}
									{selecting ? ' — цель' : ''}
								</Button>
							);
							return (
								<Tooltip
									key={ability.slot}
									label={<Text size="xs" style={{ whiteSpace: 'pre-wrap' }}>{tip}</Text>}
									multiline
									maw={280}
								>
									<span>{button}</span>
								</Tooltip>
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
							setConfirm(null);
							onAction({ unitId: active.id, action: 'defend' });
						}}
					>
						Защита
					</Button>
					<Button
						variant="light"
						color="brand"
						loading={busy}
						onClick={() => {
							setPendingMode(null);
							setConfirm(null);
							onAction({ unitId: active.id, action: 'move' });
						}}
					>
						Сменить ряд
					</Button>
					<Button
						variant="default"
						loading={busy}
						onClick={() => {
							setPendingMode(null);
							setConfirm(null);
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

			<UnitInspectModal unit={inspectUnit} onClose={() => setInspectUnit(null)} />
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

const sortRowUnits = (units: BattleUnit[]): BattleUnit[] =>
	[...units].sort((a, b) => {
		if (a.alive !== b.alive) {
			return a.alive ? -1 : 1;
		}
		return a.column - b.column;
	});

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
}) => {
	const ordered = sortRowUnits(units);
	return (
		<div>
			<Text size="xs" c="var(--app-text-muted)" mb={4}>
				{label}
			</Text>
			<div className={styles.row}>
				{ordered.length === 0 ? (
					<Text size="sm" c="var(--app-text-muted)">
						—
					</Text>
				) : (
					ordered.map((unit) => (
						<button
							key={unit.id}
							type="button"
							className={styles.unit}
							data-active={unit.id === activeId ? 'true' : undefined}
							data-target={legalTargets.includes(unit.id) ? 'true' : undefined}
							data-dead={unit.alive ? undefined : 'true'}
							data-summon={unit.isSummon ? 'true' : undefined}
							data-inspectable="true"
							onClick={() => onUnitClick(unit)}
						>
							<Group gap={6} wrap="nowrap" justify="space-between" w="100%">
								<Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
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
								{typeof unit.lvl === 'number' ? (
									<Text
										size="xs"
										c="var(--app-text-muted)"
										title="Уровень"
										aria-label={`Уровень ${unit.lvl}`}
										style={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}
									>
										{unit.lvl}
									</Text>
								) : null}
							</Group>
							<CombatStatRow className={styles.hp}>
								<CombatStat kind="health" value={`${unit.health}/${unit.maxHp}`} />
								{typeof unit.armor === 'number' ? (
									<CombatStat kind="armor" value={unit.armor} muted />
								) : null}
								{!unit.alive ? <CombatStat kind="fallen" /> : null}
							</CombatStatRow>
							<UnitEffects effects={unit.effects ?? []} />
						</button>
					))
				)}
			</div>
		</div>
	);
};

const outcomeLabel = (battle: BattleState, playerId: string): string => {
	if (battle.outcome === 'draw') {
		return 'Ничья.';
	}
	if (battle.winnerPlayerId === playerId) {
		return 'Победа!';
	}
	return 'Поражение.';
};
