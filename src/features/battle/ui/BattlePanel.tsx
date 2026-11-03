import { Button, Group, Modal, Stack, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import {
	formatAbilityPreview,
	getAbilityPreview,
	getHeroAbilities,
	HeroImage,
	previewCtxFromUnit,
} from '@/entities/hero';
import { perkName } from '@/entities/item';
import type { AbilityInfo, BattleState, BattleUnit, InventoryStack, Match } from '@/entities/match';
import { BattleFairBar, battleFairStyles } from '@/features/battle-fair';
import { BattleInventoryPanel, legalItemTargetIds } from '@/features/battle-inventory';
import { BattlePerksPanel } from '@/features/battle-perks';
import { PlayerIdentity } from '@/shared/ui/PlayerAvatar';

import {
	type AttackPreview,
	previewAbilityOnTarget,
	previewHealFromAbilityParts,
	previewWeaponAttack,
} from '../lib/attackPreview';
import { playBattleSfxEvents, preloadUnitSfx, unlockBattleSfx } from '../lib/battleSfx';
import { formatAbilityBlockReason } from '../lib/formatAbilityBlockReason';
import { playYourTurnSound, unlockTurnAudio } from '../lib/turnNotify';
import { AbilityTags } from './AbilityTags';
import { renderBattleLogLine } from './BattleLogLine';
import styles from './BattlePanel.module.css';
import { BattleSoundControl } from './BattleSoundControl';
import { CombatStat, CombatStatRow } from './CombatStat';
import { type MatchResultKind, MatchResultOverlay } from './MatchResultOverlay';
import { PortraitHpCurtain } from './PortraitHpCurtain';
import { PresetCallsign } from './PresetNamesBanner';
import { TeamWallet } from './TeamWallet';
import { TurnOrderStrip } from './TurnOrderStrip';
import { UnitEffects } from './UnitEffects';
import { UnitInspectModal } from './UnitInspectModal';

const ABILITY_TOOLTIP_STYLES = {
	tooltip: {
		background: '#1A130E',
		color: '#E8DFD0',
		fontSize: 14,
		lineHeight: 1.35,
		padding: '0.55rem 0.7rem',
		border: '1px solid color-mix(in srgb, #E9C08F 35%, #5E4A33)',
		borderRadius: 0,
		boxShadow: 'none',
	},
} as const;

type DamageFloat = {
	id: string;
	unitId: string;
	amount: number;
	heal: boolean;
};

/** Портрет на карточке поля (крупнее: имена и перки читаются). */
const FIELD_PORTRAIT = 52;

type BattleActionKind =
	| 'attack'
	| 'defend'
	| 'wait'
	| 'skill'
	| 'ability'
	| 'move'
	| 'item'
	| 'perk_pick'
	| 'perk_skip'
	| 'fair_buy'
	| 'fair_sell'
	| 'fair_sell_all'
	| 'fair_stop';

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
		itemCode?: number;
		perkId?: string;
	}) => void;
	onSurrender: () => void;
	onOfferDraw: () => void;
	onAcceptDraw: () => void;
	onDeclineDraw: () => void;
	/** Итог матча: реванш / навигация (AC-1). */
	onRematch?: () => void;
	onLobby?: () => void;
	onMatches?: () => void;
	/** Ждём myRating / durationSeconds после battle:ended. */
	resultMetaLoading?: boolean;
};

type PendingMode =
	| { kind: 'attack' }
	| { kind: 'skill' }
	| { kind: 'ability'; slot: 1 | 2 | 3 | 4 | 5 }
	| { kind: 'item'; itemCode: number; target: InventoryStack['target'] }
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
		choice?: string;
		itemCode?: number;
		perkId?: string;
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
	onRematch,
	onLobby,
	onMatches,
	resultMetaLoading = false,
}: BattlePanelProps) => {
	const battle = match.battle;
	const [pendingMode, setPendingMode] = useState<PendingMode>(null);
	const [confirm, setConfirm] = useState<ConfirmState | null>(null);
	const [promptHoverUnitId, setPromptHoverUnitId] = useState<string | null>(null);
	const [inspectUnitId, setInspectUnitId] = useState<string | null>(null);
	const [bagOpen, setBagOpen] = useState(false);
	const [surrenderOpened, surrenderHandlers] = useDisclosure(false);
	const [damageFloats, setDamageFloats] = useState<DamageFloat[]>([]);
	const [cachedMyAbilities, setCachedMyAbilities] = useState<AbilityInfo[]>([]);
	const wasMyTurnRef = useRef(false);
	const prevPhaseRef = useRef<string | null>(null);
	const logRef = useRef<HTMLDivElement>(null);
	const prevHpRef = useRef<Map<string, number> | null>(null);
	const floatSeqRef = useRef(0);

	const phase = battle?.phase ?? 'combat';
	const economyEnabled = Boolean(battle?.economyEnabled);
	const isMyTurn =
		Boolean(battle) &&
		battle!.outcome === 'ongoing' &&
		(phase === 'perks'
			? Boolean(battle!.perkOffers?.some((o) => o.playerId === playerId && !o.done))
			: battle!.turnPlayerId === playerId);

	useEffect(() => {
		if (isMyTurn && !wasMyTurnRef.current && phase === 'combat') {
			playYourTurnSound();
		}
		if (!isMyTurn && phase === 'combat') {
			setPendingMode(null);
			setConfirm(null);
			setBagOpen(false);
		}
		wasMyTurnRef.current = isMyTurn;
	}, [isMyTurn, phase]);

	useEffect(() => {
		if (!battle || battle.outcome !== 'ongoing') {
			prevPhaseRef.current = phase;
			return;
		}
		const prev = prevPhaseRef.current;
		prevPhaseRef.current = phase;
		if (prev && prev !== phase && (phase === 'fair' || phase === 'perks')) {
			playYourTurnSound();
		}
	}, [battle, phase]);

	/** AC-5: Esc отменяет выбор цели. */
	useEffect(() => {
		if (!pendingMode) {
			return;
		}
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				setPendingMode(null);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [pendingMode]);

	/** AC-5: всплывающие числа урона/лечения по diff ОЗ. */
	useEffect(() => {
		if (!battle) {
			prevHpRef.current = null;
			return;
		}
		const next = new Map(battle.units.map((unit) => [unit.id, unit.health]));
		const prev = prevHpRef.current;
		prevHpRef.current = next;
		if (!prev) {
			return;
		}
		const spawned: DamageFloat[] = [];
		for (const unit of battle.units) {
			const before = prev.get(unit.id);
			if (typeof before !== 'number' || before === unit.health) {
				continue;
			}
			const delta = unit.health - before;
			floatSeqRef.current += 1;
			spawned.push({
				id: `${unit.id}-${floatSeqRef.current}`,
				unitId: unit.id,
				amount: Math.abs(delta),
				heal: delta > 0,
			});
		}
		if (spawned.length === 0) {
			return;
		}
		setDamageFloats((list) => [...list, ...spawned]);
		const timers = spawned.map((item) =>
			window.setTimeout(() => {
				setDamageFloats((list) => list.filter((entry) => entry.id !== item.id));
			}, 950),
		);
		return () => {
			for (const timer of timers) {
				window.clearTimeout(timer);
			}
		};
	}, [battle]);

	/** Свои способности на ход соперника — серый снимок последнего своего хода (AC-5). */
	useEffect(() => {
		if (!battle || battle.outcome !== 'ongoing') {
			return;
		}
		if (battle.turnPlayerId === playerId && (battle.abilities?.length ?? 0) > 0) {
			setCachedMyAbilities(battle.abilities ?? []);
		}
	}, [battle, playerId]);

	const unitCodesKey = battle
		? [...new Set(battle.units.map((unit) => unit.heroClassCode))].sort().join(',')
		: '';
	useEffect(() => {
		if (unitCodesKey) {
			preloadUnitSfx(unitCodesKey.split(','));
		}
	}, [unitCodesKey]);

	// Первый снимок только запоминает хвост: после входа в бой старые события не звучат.
	const sfxEvents = battle?.sfxEvents;
	const lastSfxSeqRef = useRef<number | null>(null);
	useEffect(() => {
		if (!sfxEvents) {
			return;
		}
		const maxSeq = sfxEvents.reduce((max, event) => Math.max(max, event.seq), 0);
		const lastSeq = lastSfxSeqRef.current;
		lastSfxSeqRef.current = Math.max(lastSeq ?? 0, maxSeq);
		if (lastSeq === null) {
			return;
		}
		const fresh = sfxEvents.filter((event) => event.seq > lastSeq);
		if (fresh.length > 0) {
			playBattleSfxEvents(fresh);
		}
	}, [sfxEvents]);

	// Автопрокрутка журнала к последним событиям.
	const logLines = battle?.log;
	useEffect(() => {
		const el = logRef.current;
		if (el && logLines) {
			el.scrollTop = el.scrollHeight;
		}
	}, [logLines]);

	if (!battle) {
		if (match.status === 'finished' && onRematch && onLobby && onMatches) {
			return (
				<div className={styles.panel}>
					<div className={styles.battlefield} style={{ minHeight: '18rem' }}>
						<MatchResultOverlay
							result={resultFromMatch(match, playerId)}
							myRating={match.myRating}
							durationSeconds={match.durationSeconds}
							metaLoading={resultMetaLoading}
							busy={busy}
							onRematch={onRematch}
							onLobby={onLobby}
							onMatches={onMatches}
						/>
					</div>
				</div>
			);
		}
		return <Text c="var(--app-text-muted)">Загрузка боя…</Text>;
	}

	const active = battle.units.find((unit) => unit.id === battle.activeUnitId) ?? null;
	const activeEnemies = active
		? battle.units.filter((unit) => unit.alive && unit.team !== active.team)
		: [];
	const inspectUnit =
		inspectUnitId === null
			? null
			: (battle.units.find((unit) => unit.id === inspectUnitId) ?? null);
	const drawOfferBy = battle.drawOfferByPlayerId ?? null;
	const myDrawOffer = drawOfferBy === playerId;
	const opponentDrawOffer = Boolean(drawOfferBy) && drawOfferBy !== playerId;
	const hostUnits = battle.units.filter((unit) => unit.team === 0);
	const guestUnits = battle.units.filter((unit) => unit.team === 1);
	const hpByUnitId = new Map(
		battle.units.map((unit) => [unit.id, { health: unit.health, maxHp: unit.maxHp }]),
	);
	const abilities = battle.abilities ?? [];
	const isPilot = abilities.length > 0;
	const skillLabel = battle.skillLabel;
	const skillNeedsTarget = (battle.legalSkillTargetIds?.length ?? 0) > 0;
	const prompt = battle.pendingPrompt;
	const abilityDocs = active ? getHeroAbilities(active.heroClassCode, true).slots : [];

	const myTeam: 0 | 1 = match.host.id === playerId ? 0 : 1;
	const myInventory = battle.teams?.[myTeam]?.inventory ?? [];
	const fairActor =
		phase === 'fair' && battle.fair
			? (battle.units.find((u) => u.id === battle.fair!.traderIds[myTeam]) ??
				battle.units.find((u) => u.playerId === playerId && u.alive) ??
				null)
			: null;

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
		if (pendingMode.kind === 'item' && active) {
			return legalItemTargetIds(battle.units, active, pendingMode.target);
		}
		if (pendingMode.kind === 'ability') {
			const ability = abilities.find((item) => item.slot === pendingMode.slot);
			return ability?.legalTargetIds ?? [];
		}
		return [];
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
			detail: isAoe ? 'Действие затронет несколько целей или область.' : 'Подтвердите применение.',
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
		if (!active || !isMyTurn || prompt || phase !== 'combat') {
			return;
		}
		if (battle.legalTargetIds.length === 0) {
			return;
		}
		setPendingMode({ kind: 'attack' });
		setConfirm(null);
	};

	const handleSkillClick = () => {
		if (!active || !isMyTurn || !skillLabel || prompt || phase !== 'combat') {
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
		if (!active || !isMyTurn || prompt || ability.disabledReason || phase !== 'combat') {
			return;
		}
		if (!ability.needsTarget) {
			requestAbilityNoTarget(ability);
			return;
		}
		setPendingMode({ kind: 'ability', slot: ability.slot });
		setConfirm(null);
	};

	const castAtUnitId = (unitId: string) => {
		if (!pendingMode || !active || !isMyTurn || prompt || !highlightTargets.includes(unitId)) {
			return;
		}
		if (pendingMode.kind === 'ability') {
			const ability = abilities.find((item) => item.slot === pendingMode.slot);
			if (ability) {
				castNow({
					unitId: active.id,
					action: 'ability',
					slot: ability.slot,
					targetId: unitId,
				});
			}
			return;
		}
		if (pendingMode.kind === 'item') {
			castNow({
				unitId: active.id,
				action: 'item',
				itemCode: pendingMode.itemCode,
				targetId: unitId,
			});
			setBagOpen(false);
			return;
		}
		if (pendingMode.kind === 'attack') {
			castNow({ unitId: active.id, action: 'attack', targetId: unitId });
			return;
		}
		castNow({ unitId: active.id, action: 'skill', targetId: unitId });
	};

	const handleItemSelect = (stack: InventoryStack) => {
		if (!active || !isMyTurn || prompt || phase !== 'combat') {
			return;
		}
		if (stack.target === 'self') {
			openConfirm({
				title: stack.name,
				detail: stack.description || 'Применить на себя?',
				isAoe: false,
				payload: { unitId: active.id, action: 'item', itemCode: stack.code },
			});
			setBagOpen(false);
			return;
		}
		setPendingMode({ kind: 'item', itemCode: stack.code, target: stack.target });
		setConfirm(null);
	};

	/** AC-5: клик по юниту бьёт только в режиме цели; модалка — «i» / ПКМ. */
	const handleUnitClick = (unit: BattleUnit) => {
		if (pendingMode) {
			castAtUnitId(unit.id);
		}
	};

	const handlePromptChoice = (choiceId: string) => {
		if (!active || !isMyTurn || !prompt) {
			return;
		}
		const isItemPrompt = prompt.source === 'item';
		onAction({
			unitId: active.id,
			action: isItemPrompt ? 'item' : 'ability',
			slot: prompt.slot ?? undefined,
			choice: choiceId,
			itemCode: isItemPrompt ? (prompt.itemCode ?? undefined) : undefined,
		});
		setPendingMode(null);
		setConfirm(null);
		setPromptHoverUnitId(null);
	};

	/** CUT AC-13 п.25: прогноз урона/лечения/попадания при наведении на цель. */
	const attackPreviewFor = (unit: BattleUnit): AttackPreview | null => {
		if (!active || !pendingMode || !highlightTargets.includes(unit.id)) {
			return null;
		}
		if (pendingMode.kind === 'attack') {
			return previewWeaponAttack(active, unit, battle.attackKind ?? 'melee');
		}
		if (pendingMode.kind === 'ability') {
			const ability = abilities.find((item) => item.slot === pendingMode.slot);
			if (!ability) {
				return null;
			}
			const fromServer = previewAbilityOnTarget(active, unit, ability);
			if (fromServer) {
				return fromServer;
			}
			// Фоллбек: формулы страницы героя (лечение и т.п. без attackKind).
			return previewHealFromAbilityParts(
				getAbilityPreview(active.heroClassCode, ability.slot, {
					...previewCtxFromUnit({
						...active,
						gold: battle.teams?.[active.team]?.gold ?? 0,
					}),
					targetHpRatio: unit.maxHp > 0 ? unit.health / unit.maxHp : 1,
				}),
			);
		}
		return null;
	};

	return (
		<div
			className={styles.panel}
			onPointerDownCapture={() => {
				unlockTurnAudio();
				unlockBattleSfx();
			}}
		>
			<Group justify="space-between" wrap="wrap">
				<Text fw={600}>
					Раунд {battle.stage}
					{battle.outcome === 'ongoing' ? (isMyTurn ? ' · ваш ход' : ' · ход соперника') : ''}
				</Text>
				<Group gap="sm" wrap="wrap">
					<BattleSoundControl />
					{active && battle.outcome === 'ongoing' && (
						<Text size="sm" c="var(--app-text-muted)">
							Ходит: {active.displayName}
							{typeof active.mana === 'number' && (active.mana > 0 || active.maxMana > 0)
								? ` · Мана ${active.mana}/${active.maxMana || active.mana}`
								: ''}
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
				hpByUnitId={hpByUnitId}
				targeting={Boolean(pendingMode && isMyTurn && !prompt)}
				targetUnitIds={highlightTargets}
				onCastAtUnit={castAtUnitId}
				onInspectUnit={(unitId) => setInspectUnitId(unitId)}
			/>

			<div className={styles.battlefield}>
				{battle.outcome !== 'ongoing' && onRematch && onLobby && onMatches && (
					<MatchResultOverlay
						result={toMatchResultKind(battle, playerId)}
						myRating={match.myRating}
						durationSeconds={match.durationSeconds}
						metaLoading={resultMetaLoading}
						busy={busy}
						onRematch={onRematch}
						onLobby={onLobby}
						onMatches={onMatches}
					/>
				)}
				<div className={`${styles.field}${phase === 'fair' ? ` ${battleFairStyles.dimmed}` : ''}`}>
					<p className={styles.rowLegend}>П — передний ряд, З — задний</p>
					<TeamSide
						title={
							<PlayerIdentity
								name={match.host.displayName}
								avatarUrl={match.host.avatarUrl}
								prefix="Игрок 1"
								size={FIELD_PORTRAIT}
							/>
						}
						teamGold={battle.teams?.[0]?.gold ?? 0}
						playerName={match.host.displayName}
						presetName={match.draft.hostPresetName}
						presetActive={battle.outcome === 'ongoing'}
						presetAlign="start"
						units={hostUnits}
						mirror
						activeId={battle.activeUnitId}
						legalTargets={highlightTargets}
						promptHoverUnitId={promptHoverUnitId}
						onUnitClick={handleUnitClick}
						onInspectUnit={(unitId) => setInspectUnitId(unitId)}
						attackPreviewFor={attackPreviewFor}
						damageFloats={damageFloats}
					/>
					<TeamSide
						title={
							<PlayerIdentity
								name={match.guest?.displayName ?? '…'}
								avatarUrl={match.guest?.avatarUrl}
								prefix="Игрок 2"
								size={FIELD_PORTRAIT}
							/>
						}
						teamGold={battle.teams?.[1]?.gold ?? 0}
						playerName={match.guest?.displayName ?? '…'}
						presetName={match.draft.guestPresetName}
						presetActive={battle.outcome === 'ongoing'}
						presetAlign="end"
						units={guestUnits}
						mirror={false}
						activeId={battle.activeUnitId}
						legalTargets={highlightTargets}
						promptHoverUnitId={promptHoverUnitId}
						onUnitClick={handleUnitClick}
						onInspectUnit={(unitId) => setInspectUnitId(unitId)}
						attackPreviewFor={attackPreviewFor}
						damageFloats={damageFloats}
					/>
				</div>
				<div className={styles.log} aria-live="polite" ref={logRef}>
					<Text size="sm" c="var(--app-text-muted)" mb={6}>
						Журнал
					</Text>
					{battle.log.map((line, index) => (
						<span key={`${index}-${line}`}>{renderBattleLogLine(line)}</span>
					))}
				</div>
			</div>

			{battle.outcome === 'ongoing' && phase === 'fair' && battle.fair && fairActor ? (
				<BattleFairBar
					fair={battle.fair}
					units={battle.units}
					hostGold={battle.teams?.[0]?.gold ?? 0}
					guestGold={battle.teams?.[1]?.gold ?? 0}
					myTeam={myTeam}
					isMyTurn={battle.turnPlayerId === playerId}
					busy={busy}
					hostName={match.host.displayName}
					guestName={match.guest?.displayName ?? '…'}
					onBuy={(itemCode) => onAction({ unitId: fairActor.id, action: 'fair_buy', itemCode })}
					onSell={(itemCode) => onAction({ unitId: fairActor.id, action: 'fair_sell', itemCode })}
					onSellAll={() => onAction({ unitId: fairActor.id, action: 'fair_sell_all' })}
					onStop={() => onAction({ unitId: fairActor.id, action: 'fair_stop' })}
				/>
			) : null}

			{battle.outcome === 'ongoing' && phase === 'perks' ? (
				<BattlePerksPanel
					offers={battle.perkOffers ?? []}
					units={battle.units}
					playerId={playerId}
					busy={busy}
					onPick={(unitId, perkId) => onAction({ unitId, action: 'perk_pick', perkId })}
					onSkip={(unitId) => onAction({ unitId, action: 'perk_skip' })}
				/>
			) : null}

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
						<Button variant="default" disabled={busy} onClick={() => setConfirm(null)}>
							Отмена
						</Button>
					</Group>
				</div>
			)}

			{battle.outcome === 'ongoing' && isMyTurn && active && prompt && (
				<div className={styles.prompt}>
					<Text size="sm" fw={600} mb={6}>
						{prompt.kind === 'lich_final_form' ? 'Выберите финальную форму' : 'Выберите вариант'}
					</Text>
					<div className={styles.promptOptions}>
						{prompt.options.map((option) => {
							const isFieldUnit = battle.units.some((unit) => unit.id === option.id);
							return (
								<div key={option.id} className={styles.promptOption}>
									<Button
										color="accent"
										loading={busy}
										onClick={() => handlePromptChoice(option.id)}
										onMouseEnter={() => {
											if (isFieldUnit) {
												setPromptHoverUnitId(option.id);
											}
										}}
										onMouseLeave={() => setPromptHoverUnitId(null)}
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
							);
						})}
					</div>
				</div>
			)}

			{battle.outcome === 'ongoing' && phase === 'combat' && !prompt && !confirm && (
				<div className={styles.actions} data-opponent={isMyTurn ? undefined : 'true'}>
					{pendingMode && isMyTurn ? (
						<div className={styles.targetHint} role="status">
							Выберите цель · Esc — отмена
						</div>
					) : null}
					{!isMyTurn && active ? (
						<div className={styles.opponentTurn}>
							<HeroImage
								code={active.heroClassCode}
								alt={active.displayName}
								w={40}
								h={40}
								radius={0}
							/>
							<div>
								<Text size="sm" fw={600}>
									Ходит соперник: {active.displayName}
								</Text>
								<Text size="sm" c="var(--app-text-muted)">
									Ожидание хода
								</Text>
							</div>
							<span className={styles.opponentWait} aria-label="Ожидание" />
						</div>
					) : null}
					{isMyTurn && active ? (
						<>
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
														previewCtxFromUnit(
															{
																...active,
																gold: battle.teams?.[active.team]?.gold ?? 0,
															},
															activeEnemies,
														),
													),
												)
											: null;
									const blockReason = ability.disabledReason
										? formatAbilityBlockReason(ability.disabledReason, active.mana, active.maxMana)
										: null;
									const tip = (
										<div className={styles.abilityTip}>
											<strong>{doc?.title ?? ability.label}</strong>
											{doc ? <span>{doc.body}</span> : null}
											{doc?.mechanics ? (
												<span className={styles.abilityTipMeta}>{doc.mechanics}</span>
											) : null}
											{preview ? <span className={styles.abilityTipMeta}>{preview}</span> : null}
											{blockReason ? (
												<span className={styles.abilityTipMeta}>{blockReason}</span>
											) : null}
										</div>
									);
									const button = (
										<Button
											variant={ability.slot === 1 ? 'filled' : 'light'}
											color="accent"
											loading={busy}
											disabled={Boolean(ability.disabledReason)}
											onClick={() => handleAbilityClick(ability)}
											leftSection={doc ? <AbilityTags tags={doc.tags} size={12} /> : undefined}
										>
											[{ability.slot}] {ability.label}
											{selecting ? ' — цель' : ''}
											{blockReason ? (
												<span className={styles.abilityBtnReason}>{blockReason}</span>
											) : null}
										</Button>
									);
									return (
										<Tooltip
											key={ability.slot}
											label={tip}
											multiline
											maw={300}
											events={{ hover: true, focus: true, touch: true }}
											styles={ABILITY_TOOLTIP_STYLES}
										>
											<span tabIndex={0}>{button}</span>
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
							{economyEnabled ? (
								<BattleInventoryPanel
									inventory={myInventory}
									actor={active}
									open={bagOpen}
									selectedCode={pendingMode?.kind === 'item' ? pendingMode.itemCode : null}
									busy={busy}
									onToggle={() => {
										setBagOpen((v) => !v);
										setPendingMode(null);
										setConfirm(null);
									}}
									onSelect={handleItemSelect}
								/>
							) : null}
						</>
					) : (
						(cachedMyAbilities.length > 0 ? cachedMyAbilities : abilities).map((ability) => (
							<Button
								key={`opp-${ability.slot}`}
								variant={ability.slot === 1 ? 'filled' : 'light'}
								color="accent"
								disabled
							>
								[{ability.slot}] {ability.label}
							</Button>
						))
					)}
				</div>
			)}

			<UnitInspectModal
				unit={inspectUnit}
				economyEnabled={economyEnabled}
				onClose={() => setInspectUnitId(null)}
			/>

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
						radius={0}
						loading={busy}
						styles={{
							root: {
								background: 'var(--enemy, #D9574A)',
								color: '#17110C',
								border: '1px solid color-mix(in srgb, var(--enemy, #D9574A) 70%, #000)',
							},
						}}
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
	teamGold,
	playerName,
	presetName,
	presetActive,
	presetAlign,
	units,
	mirror,
	activeId,
	legalTargets,
	promptHoverUnitId,
	onUnitClick,
	onInspectUnit,
	attackPreviewFor,
	damageFloats,
}: {
	title: ReactNode;
	teamGold: number;
	playerName: string;
	presetName: string | null | undefined;
	presetActive: boolean;
	presetAlign: 'start' | 'end';
	units: BattleUnit[];
	mirror: boolean;
	activeId: string | null;
	legalTargets: string[];
	promptHoverUnitId: string | null;
	onUnitClick: (unit: BattleUnit) => void;
	onInspectUnit: (unitId: string) => void;
	attackPreviewFor: (unit: BattleUnit) => AttackPreview | null;
	damageFloats: DamageFloat[];
}) => {
	const front = units.filter((unit) => unit.row === 0);
	const back = units.filter((unit) => unit.row === 1);
	const left = mirror ? back : front;
	const right = mirror ? front : back;
	const leftLabel = mirror ? 'Задний ряд' : 'Передний ряд';
	const rightLabel = mirror ? 'Передний ряд' : 'Задний ряд';

	return (
		<div className={styles.side}>
			<div className={styles.sideTitle}>
				{title}
				<TeamWallet gold={teamGold} />
			</div>
			<PresetCallsign
				playerName={playerName}
				presetName={presetName}
				active={presetActive}
				align={presetAlign}
			/>
			<div className={styles.rows}>
				<RowColumn
					label={leftLabel}
					units={left}
					activeId={activeId}
					legalTargets={legalTargets}
					promptHoverUnitId={promptHoverUnitId}
					onUnitClick={onUnitClick}
					onInspectUnit={onInspectUnit}
					attackPreviewFor={attackPreviewFor}
					damageFloats={damageFloats}
				/>
				<RowColumn
					label={rightLabel}
					units={right}
					activeId={activeId}
					legalTargets={legalTargets}
					promptHoverUnitId={promptHoverUnitId}
					onUnitClick={onUnitClick}
					onInspectUnit={onInspectUnit}
					attackPreviewFor={attackPreviewFor}
					damageFloats={damageFloats}
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
	promptHoverUnitId,
	onUnitClick,
	onInspectUnit,
	attackPreviewFor,
	damageFloats,
}: {
	label: string;
	units: BattleUnit[];
	activeId: string | null;
	legalTargets: string[];
	promptHoverUnitId: string | null;
	onUnitClick: (unit: BattleUnit) => void;
	onInspectUnit: (unitId: string) => void;
	attackPreviewFor: (unit: BattleUnit) => AttackPreview | null;
	damageFloats: DamageFloat[];
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
						const isTarget = legalTargets.includes(unit.id);
						const ratio = unit.maxHp > 0 ? Math.max(0, Math.min(1, unit.health / unit.maxHp)) : 0;
						const hpBand = ratio >= 0.5 ? 'high' : ratio >= 0.25 ? 'mid' : 'low';
						const floats = damageFloats.filter((item) => item.unitId === unit.id);
						const button = (
							<div
								key={unit.id}
								className={styles.unit}
								style={{ position: 'relative' }}
								data-active={unit.id === activeId ? 'true' : undefined}
								data-target={isTarget ? 'true' : undefined}
								data-prompt-hover={unit.id === promptHoverUnitId ? 'true' : undefined}
								data-dead={unit.alive ? undefined : 'true'}
								data-summon={unit.isSummon ? 'true' : undefined}
								role={isTarget ? 'button' : undefined}
								tabIndex={isTarget ? 0 : undefined}
								onClick={() => onUnitClick(unit)}
								onKeyDown={(event) => {
									if (!isTarget) {
										return;
									}
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault();
										onUnitClick(unit);
									}
								}}
								onContextMenu={(event) => {
									event.preventDefault();
									onInspectUnit(unit.id);
								}}
							>
								{floats.map((item) => (
									<span
										key={item.id}
										className={styles.damageFloat}
										data-heal={item.heal ? 'true' : undefined}
										aria-hidden
									>
										{item.heal ? `+${item.amount}` : `−${item.amount}`}
									</span>
								))}
								<div className={styles.unitHead}>
									<PortraitHpCurtain health={unit.health} maxHp={unit.maxHp}>
										<HeroImage
											code={unit.heroClassCode}
											alt={unit.displayName}
											w={FIELD_PORTRAIT}
											h={FIELD_PORTRAIT}
											radius={0}
										/>
									</PortraitHpCurtain>
									<div className={styles.unitHeadMain}>
										<div className={styles.unitHeadTop}>
											<span className={styles.slotIndex} title="Место на поле">
												{unit.row === 0 ? 'П' : 'З'}
												{unit.column + 1}
											</span>
											<span className={styles.unitHeadSpacer} />
											{typeof unit.lvl === 'number' ? (
												<span
													className={styles.lvl}
													title="Уровень"
													aria-label={`Уровень ${unit.lvl}`}
												>
													Ур.{unit.lvl}
												</span>
											) : null}
											<button
												type="button"
												className={styles.unitInfoBtn}
												aria-label={`Сведения: ${unit.displayName}`}
												title="Сведения о герое"
												onClick={(event) => {
													event.stopPropagation();
													onInspectUnit(unit.id);
												}}
											>
												i
											</button>
										</div>
										<div className={styles.unitName}>
											{unit.isSummon ? '✦ ' : ''}
											{unit.displayName}
											{unit.defending ? ' 🛡' : ''}
											{unit.horseIsDead ? ' ✗конь' : ''}
										</div>
									</div>
								</div>
								{(unit.perks?.length ?? 0) > 0 ? (
									<div className={styles.unitPerks} title={(unit.perks ?? []).map(perkName).join(', ')}>
										{(unit.perks ?? []).map((id) => (
											<span key={id} className={styles.unitPerkChip}>
												{perkName(id)}
											</span>
										))}
									</div>
								) : null}
								<div className={styles.hpBar} aria-label={`ОЗ: ${unit.health} из ${unit.maxHp}`}>
									<div className={styles.hpBarTrack}>
										<div
											className={styles.hpBarFill}
											data-band={hpBand === 'high' ? undefined : hpBand}
											style={{ width: `${Math.round(ratio * 100)}%` }}
										/>
									</div>
									<span
										className={styles.hpBarValue}
										data-band={hpBand === 'low' ? 'low' : undefined}
									>
										{unit.health}/{unit.maxHp}
									</span>
								</div>
								<CombatStatRow className={styles.hp}>
									{typeof unit.armor === 'number' ? (
										<CombatStat kind="armor" value={unit.armor} size={14} textSize="sm" muted />
									) : null}
									{unit.alive && (unit.mana > 0 || unit.maxMana > 0) ? (
										<CombatStat
											kind="mana"
											value={`${unit.mana}/${unit.maxMana || unit.mana}`}
											size={14}
											textSize="sm"
											muted
										/>
									) : null}
									{!unit.alive ? <CombatStat kind="fallen" size={14} textSize="sm" /> : null}
								</CombatStatRow>
								<UnitEffects effects={unit.effects ?? []} resists={unit.resists ?? []} />
							</div>
						);
						if (!preview) {
							return button;
						}
						const amountColor = preview.lowDamage ? 'red' : undefined;
						const amountLabel =
							preview.minDamage === preview.maxDamage
								? `≈${preview.minDamage}`
								: `≈${preview.minDamage}–${preview.maxDamage}`;
						return (
							<Tooltip
								key={unit.id}
								multiline
								w={220}
								withArrow
								label={
									<Stack gap={2}>
										<Text size="xs" fw={600}>
											{preview.mode === 'heal' ? 'Прогноз лечения' : 'Прогноз урона'}
										</Text>
										{preview.blockedLabel ? (
											<Text size="xs">Удар заблокирован: {preview.blockedLabel}</Text>
										) : (
											<Text size="xs" c={amountColor} fw={preview.lowDamage ? 700 : undefined}>
												{amountLabel} {preview.mode === 'heal' ? 'лечения' : 'урона'}
											</Text>
										)}
										{preview.hitChance !== null ? (
											<Text size="xs" c="dimmed">
												Попадание {preview.hitChance}%
												{preview.mode === 'damage'
													? ` · крит ${preview.critChance === null ? 'гарантирован' : `${preview.critChance}%`}`
													: ''}
											</Text>
										) : null}
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

const toMatchResultKind = (battle: BattleState, playerId: string): MatchResultKind => {
	if (battle.outcome === 'draw') {
		return 'draw';
	}
	if (battle.winnerPlayerId === playerId) {
		return 'win';
	}
	return 'loss';
};

const resultFromMatch = (match: Match, playerId: string): MatchResultKind => {
	if (!match.winnerPlayerId) {
		return 'draw';
	}
	if (match.winnerPlayerId === playerId) {
		return 'win';
	}
	return 'loss';
};
