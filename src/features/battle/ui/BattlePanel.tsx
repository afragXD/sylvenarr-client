import { Button, Group, Modal, Stack, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useRef, useState } from 'react';

import {
	formatAbilityPreview,
	getAbilityPreview,
	getHeroAbilities,
	HeroImage,
	previewCtxFromUnit,
} from '@/entities/hero';
import type { AbilityInfo, BattleState, BattleUnit, Match } from '@/entities/match';

import { previewWeaponAttack, type AttackPreview } from '../lib/attackPreview';
import { playYourTurnSound, unlockTurnAudio } from '../lib/turnNotify';
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
	onSurrender: () => void;
	onOfferDraw: () => void;
	onAcceptDraw: () => void;
	onDeclineDraw: () => void;
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
export const BattlePanel = ({
	match,
	playerId,
	busy,
	onAction,
	onSurrender,
	onOfferDraw,
	onAcceptDraw,
	onDeclineDraw,
}: BattlePanelProps) => {
	const battle = match.battle;
	const [pendingMode, setPendingMode] = useState<PendingMode>(null);
	const [confirm, setConfirm] = useState<ConfirmState | null>(null);
	const [inspectUnitId, setInspectUnitId] = useState<string | null>(null);
	const [surrenderOpened, surrenderHandlers] = useDisclosure(false);
	const wasMyTurnRef = useRef(false);
	const logRef = useRef<HTMLDivElement>(null);

	const isMyTurn =
		Boolean(battle) && battle!.turnPlayerId === playerId && battle!.outcome === 'ongoing';

	useEffect(() => {
		if (isMyTurn && !wasMyTurnRef.current) {
			playYourTurnSound();
		}
		wasMyTurnRef.current = isMyTurn;
	}, [isMyTurn]);

	// Автопрокрутка журнала к последним событиям.
	const logLines = battle?.log;
	useEffect(() => {
		const el = logRef.current;
		if (el && logLines) {
			el.scrollTop = el.scrollHeight;
		}
	}, [logLines]);

	if (!battle) {
		return <Text c="var(--app-text-muted)">Загрузка боя…</Text>;
	}

	const active = battle.units.find((unit) => unit.id === battle.activeUnitId) ?? null;
	const inspectUnit =
		inspectUnitId === null
			? null
			: (battle.units.find((unit) => unit.id === inspectUnitId) ?? null);
	const drawOfferBy = battle.drawOfferByPlayerId ?? null;
	const myDrawOffer = drawOfferBy === playerId;
	const opponentDrawOffer = Boolean(drawOfferBy) && drawOfferBy !== playerId;
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
		setInspectUnitId(unit.id);
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

	/** Оценка базовой атаки по цели при выборе «Атака» (для hover-попапа). */
	const attackPreviewFor = (unit: BattleUnit): AttackPreview | null => {
		if (!active || pendingMode?.kind !== 'attack' || !highlightTargets.includes(unit.id)) {
			return null;
		}
		return previewWeaponAttack(active, unit);
	};

	return (
		<div className={styles.panel} onPointerDownCapture={unlockTurnAudio}>
			<Group justify="space-between" wrap="wrap">
				<Text fw={600}>
					Раунд {battle.stage}
					{battle.outcome === 'ongoing' ? (isMyTurn ? ' · ваш ход' : ' · ход соперника') : ''}
				</Text>
				<Group gap="sm" wrap="wrap">
					{active && battle.outcome === 'ongoing' && (
						<Text size="sm" c="var(--app-text-muted)">
							Ходит: {active.displayName}
							{typeof active.mana === 'number' && active.mana > 0 ? ` · МР ${active.mana}` : ''}
						</Text>
					)}
					{battle.outcome === 'ongoing' && !drawOfferBy && (
						<Button
							variant="subtle"
							color="brand"
							radius={0}
							size="compact-sm"
							disabled={busy}
							onClick={onOfferDraw}
						>
							Предложить ничью
						</Button>
					)}
					{battle.outcome === 'ongoing' && myDrawOffer && (
						<Text size="sm" c="var(--app-text-muted)">
							Ожидание ответа…
						</Text>
					)}
					{battle.outcome === 'ongoing' && (
						<Button
							variant="subtle"
							color="red"
							radius={0}
							size="compact-sm"
							disabled={busy}
							onClick={surrenderHandlers.open}
						>
							Сдаться
						</Button>
					)}
				</Group>
			</Group>

			{battle.outcome === 'ongoing' && opponentDrawOffer && (
				<div className={styles.confirm}>
					<Text size="sm" fw={600}>
						Соперник предлагает ничью
					</Text>
					<Group gap="sm" mt={8}>
						<Button color="brand" radius={0} loading={busy} onClick={onAcceptDraw}>
							Принять
						</Button>
						<Button variant="default" radius={0} disabled={busy} onClick={onDeclineDraw}>
							Отклонить
						</Button>
					</Group>
				</div>
			)}

			<TurnOrderStrip
				entries={battle.turnOrder ?? []}
				stage={battle.stage}
				onSelectUnit={(unitId) => {
					setInspectUnitId(unitId);
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
						attackPreviewFor={attackPreviewFor}
					/>
					<TeamSide
						title={`Игрок 2 · ${match.guest?.displayName ?? '…'}`}
						units={guestUnits}
						mirror={false}
						activeId={battle.activeUnitId}
						legalTargets={highlightTargets}
						onUnitClick={handleUnitClick}
						attackPreviewFor={attackPreviewFor}
					/>
				</div>
				<div className={styles.log} aria-live="polite" ref={logRef}>
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
							const preview =
								active && doc
									? formatAbilityPreview(
											getAbilityPreview(
												active.heroClassCode,
												ability.slot,
												previewCtxFromUnit(active),
											),
										)
									: null;
							const tip = ability.disabledReason
								? ability.disabledReason
								: doc
									? `${doc.title}: ${doc.body}\n${doc.mechanics}${preview ? `\n${preview}` : ''}`
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

			<UnitInspectModal unit={inspectUnit} onClose={() => setInspectUnitId(null)} />

			<Modal
				opened={surrenderOpened}
				onClose={surrenderHandlers.close}
				title="Сдаться"
				centered
				radius={0}
			>
				<Text size="sm" mb="md">
					Матч завершится поражением.
				</Text>
				<Group justify="flex-end" gap="sm">
					<Button variant="default" radius={0} onClick={surrenderHandlers.close} disabled={busy}>
						Отмена
					</Button>
					<Button
						color="red"
						radius={0}
						loading={busy}
						onClick={() => {
							surrenderHandlers.close();
							onSurrender();
						}}
					>
						Сдаться
					</Button>
				</Group>
			</Modal>
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
	attackPreviewFor,
}: {
	title: string;
	units: BattleUnit[];
	mirror: boolean;
	activeId: string | null;
	legalTargets: string[];
	onUnitClick: (unit: BattleUnit) => void;
	attackPreviewFor: (unit: BattleUnit) => AttackPreview | null;
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
					attackPreviewFor={attackPreviewFor}
				/>
				<RowColumn
					label={rightLabel}
					units={right}
					activeId={activeId}
					legalTargets={legalTargets}
					onUnitClick={onUnitClick}
					attackPreviewFor={attackPreviewFor}
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
	attackPreviewFor,
}: {
	label: string;
	units: BattleUnit[];
	activeId: string | null;
	legalTargets: string[];
	onUnitClick: (unit: BattleUnit) => void;
	attackPreviewFor: (unit: BattleUnit) => AttackPreview | null;
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
					ordered.map((unit) => {
						const preview = attackPreviewFor(unit);
						const button = (
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
										<span className={styles.lvl} title="Уровень" aria-label={`Уровень ${unit.lvl}`}>
											Ур.{unit.lvl}
										</span>
									) : null}
								</Group>
								<CombatStatRow className={styles.hp}>
									<CombatStat kind="health" value={`${unit.health}/${unit.maxHp}`} />
									{typeof unit.armor === 'number' ? (
										<CombatStat kind="armor" value={unit.armor} muted />
									) : null}
									{unit.alive && unit.mana > 0 ? (
										<CombatStat kind="mana" value={unit.mana} muted />
									) : null}
									{!unit.alive ? <CombatStat kind="fallen" /> : null}
								</CombatStatRow>
								<UnitEffects effects={unit.effects ?? []} resists={unit.resists ?? []} />
							</button>
						);
						if (!preview) {
							return button;
						}
						return (
							<Tooltip
								key={unit.id}
								multiline
								w={220}
								withArrow
								label={
									<Stack gap={2}>
										<Text size="xs" fw={600}>
											Оценка атаки
										</Text>
										{preview.blockedLabel ? (
											<Text size="xs">Удар заблокирован: {preview.blockedLabel}</Text>
										) : (
											<Text size="xs">
												≈{preview.minDamage}–{preview.maxDamage} урона
											</Text>
										)}
										<Text size="xs" c="dimmed">
											Попадание {preview.hitChance}% · крит{' '}
											{preview.critChance === null ? 'гарантирован' : `${preview.critChance}%`}
										</Text>
										{preview.resistValue !== 0 ? (
											<Text size="xs" c="dimmed">
												Резист цели: {preview.resistValue > 0 ? '−' : '+'}
												{Math.abs(preview.resistValue)}% урона
											</Text>
										) : null}
									</Stack>
								}
							>
								{button}
							</Tooltip>
						);
					})
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
