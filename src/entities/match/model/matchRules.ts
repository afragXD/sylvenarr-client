export type HeroDupesMode = 'allow' | 'uniqueTeam' | 'uniqueMatch';

const HERO_DUPES_MODES: ReadonlySet<string> = new Set([
	'allow',
	'uniqueTeam',
	'uniqueMatch',
]);

export type MatchRules = {
	initialTeamSize: number;
	maxTeamSize: number;
	maxRowSize: number;
	maxRounds: number;
	/** Множитель стартового HP (0.5 = 50%). */
	healthBonus: number;
	fairEnabled: boolean;
	fairFrequency: number;
	shopSize: number;
	goldBonus: number;
	/** Дубли классов в draft (не касается саммонов/эволюций). */
	heroDupes: HeroDupesMode;
};

export const DEFAULT_MATCH_RULES: MatchRules = {
	initialTeamSize: 3,
	maxTeamSize: 6,
	maxRowSize: 3,
	maxRounds: 20,
	healthBonus: 0.5,
	fairEnabled: false,
	fairFrequency: 5,
	shopSize: 8,
	goldBonus: 1,
	heroDupes: 'allow',
};

export const MATCH_RULES_LIMITS = {
	initialTeamSize: { min: 1, max: 6 },
	maxTeamSize: { min: 2, max: 8 },
	maxRowSize: { min: 1, max: 4 },
	maxRounds: { min: 5, max: 40, step: 5 },
	healthPercent: { min: 25, max: 100, step: 5 },
	fairFrequency: { min: 3, max: 10 },
	shopSize: { min: 4, max: 12 },
	goldBonus: { min: 0.5, max: 2, step: 0.25 },
} as const;

export type RulesPresetId = 'classic' | 'fast' | 'siege' | 'custom';

export const RULES_PRESETS: Record<
	Exclude<RulesPresetId, 'custom'>,
	Pick<MatchRules, 'initialTeamSize' | 'maxTeamSize' | 'maxRowSize' | 'maxRounds' | 'healthBonus'>
> = {
	classic: {
		initialTeamSize: 3,
		maxTeamSize: 6,
		maxRowSize: 3,
		maxRounds: 20,
		healthBonus: 0.5,
	},
	fast: {
		initialTeamSize: 3,
		maxTeamSize: 6,
		maxRowSize: 3,
		maxRounds: 10,
		healthBonus: 0.35,
	},
	siege: {
		initialTeamSize: 3,
		maxTeamSize: 6,
		maxRowSize: 3,
		maxRounds: 30,
		healthBonus: 0.75,
	},
};

export function healthBonusToPercent(bonus: number): number {
	return Math.round(bonus * 100);
}

export function healthPercentToBonus(percent: number): number {
	return Math.round(percent) / 100;
}

function normalizeHeroDupes(value: unknown): HeroDupesMode {
	return typeof value === 'string' && HERO_DUPES_MODES.has(value)
		? (value as HeroDupesMode)
		: DEFAULT_MATCH_RULES.heroDupes;
}

export type ValidateMatchRulesResult =
	| { ok: true; rules: MatchRules }
	| { ok: false; message: string };

/**
 * Клиентская валидация (зеркало сервера).
 */
export function validateMatchRules(input: MatchRules): ValidateMatchRulesResult {
	const {
		initialTeamSize,
		maxTeamSize,
		maxRowSize,
		maxRounds,
		healthBonus,
		fairEnabled,
		fairFrequency,
		shopSize,
		goldBonus,
		heroDupes,
	} = input;

	if (
		!Number.isInteger(initialTeamSize) ||
		initialTeamSize < MATCH_RULES_LIMITS.initialTeamSize.min ||
		initialTeamSize > MATCH_RULES_LIMITS.initialTeamSize.max
	) {
		return { ok: false, message: 'Некорректный стартовый размер отряда' };
	}
	if (
		!Number.isInteger(maxTeamSize) ||
		maxTeamSize < MATCH_RULES_LIMITS.maxTeamSize.min ||
		maxTeamSize > MATCH_RULES_LIMITS.maxTeamSize.max
	) {
		return { ok: false, message: 'Некорректный максимум команды' };
	}
	if (
		!Number.isInteger(maxRowSize) ||
		maxRowSize < MATCH_RULES_LIMITS.maxRowSize.min ||
		maxRowSize > MATCH_RULES_LIMITS.maxRowSize.max
	) {
		return { ok: false, message: 'Некорректный размер ряда' };
	}
	if (
		!Number.isInteger(maxRounds) ||
		maxRounds < MATCH_RULES_LIMITS.maxRounds.min ||
		maxRounds > MATCH_RULES_LIMITS.maxRounds.max
	) {
		return { ok: false, message: 'Некорректный лимит раундов' };
	}
	const pct = healthBonusToPercent(healthBonus);
	if (
		pct < MATCH_RULES_LIMITS.healthPercent.min ||
		pct > MATCH_RULES_LIMITS.healthPercent.max ||
		pct % MATCH_RULES_LIMITS.healthPercent.step !== 0
	) {
		return { ok: false, message: 'Некорректное стартовое здоровье' };
	}
	if (initialTeamSize > maxTeamSize) {
		return {
			ok: false,
			message: 'Стартовый размер отряда не может быть больше максимума команды',
		};
	}
	if (initialTeamSize > maxRowSize * 2) {
		return {
			ok: false,
			message: 'Стартовый размер отряда не помещается в два ряда',
		};
	}

	return {
		ok: true,
		rules: {
			initialTeamSize,
			maxTeamSize,
			maxRowSize,
			maxRounds,
			healthBonus: healthPercentToBonus(pct),
			fairEnabled: Boolean(fairEnabled),
			fairFrequency: Math.min(
				MATCH_RULES_LIMITS.fairFrequency.max,
				Math.max(MATCH_RULES_LIMITS.fairFrequency.min, Math.round(fairFrequency)),
			),
			shopSize: Math.min(
				MATCH_RULES_LIMITS.shopSize.max,
				Math.max(MATCH_RULES_LIMITS.shopSize.min, Math.round(shopSize)),
			),
			goldBonus: Math.min(
				MATCH_RULES_LIMITS.goldBonus.max,
				Math.max(MATCH_RULES_LIMITS.goldBonus.min, goldBonus),
			),
			heroDupes: normalizeHeroDupes(heroDupes),
		},
	};
}

export function detectPreset(rules: MatchRules): RulesPresetId {
	for (const id of ['classic', 'fast', 'siege'] as const) {
		const preset = RULES_PRESETS[id];
		if (
			rules.initialTeamSize === preset.initialTeamSize &&
			rules.maxTeamSize === preset.maxTeamSize &&
			rules.maxRowSize === preset.maxRowSize &&
			rules.maxRounds === preset.maxRounds &&
			healthBonusToPercent(rules.healthBonus) === healthBonusToPercent(preset.healthBonus)
		) {
			return id;
		}
	}
	return 'custom';
}

export function applyPreset(id: Exclude<RulesPresetId, 'custom'>, base: MatchRules): MatchRules {
	return {
		...base,
		...RULES_PRESETS[id],
		// Ярмарка до 4.1 всегда дефолт бота
		fairEnabled: DEFAULT_MATCH_RULES.fairEnabled,
		fairFrequency: DEFAULT_MATCH_RULES.fairFrequency,
		shopSize: DEFAULT_MATCH_RULES.shopSize,
		goldBonus: DEFAULT_MATCH_RULES.goldBonus,
	};
}

export function formatRulesSummary(rules: MatchRules): string {
	const hp = healthBonusToPercent(rules.healthBonus);
	const base = `Отряд ${rules.initialTeamSize}/${rules.maxTeamSize} · ряд ${rules.maxRowSize} · ${rules.maxRounds} р. · ОЗ ${hp}%`;
	if (rules.heroDupes === 'uniqueTeam') {
		return `${base} · без дублей`;
	}
	if (rules.heroDupes === 'uniqueMatch') {
		return `${base} · уникальны в матче`;
	}
	return base;
}
