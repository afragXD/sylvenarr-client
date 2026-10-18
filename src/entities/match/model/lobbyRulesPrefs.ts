import { DEFAULT_MATCH_RULES, type MatchRules, validateMatchRules } from './matchRules';

const STORAGE_KEY = 'sylvenarr.lobby-rules';

/**
 * Читает последние правила лобби из localStorage.
 */
export function loadLobbyRulesPrefs(): MatchRules {
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return { ...DEFAULT_MATCH_RULES };
		}
		const parsed = JSON.parse(raw) as unknown;
		if (typeof parsed !== 'object' || parsed === null) {
			return { ...DEFAULT_MATCH_RULES };
		}
		const merged: MatchRules = {
			...DEFAULT_MATCH_RULES,
			...(parsed as Partial<MatchRules>),
		};
		const validated = validateMatchRules(merged);
		return validated.ok ? validated.rules : { ...DEFAULT_MATCH_RULES };
	} catch {
		return { ...DEFAULT_MATCH_RULES };
	}
}

/**
 * Сохраняет правила лобби после успешного create.
 */
export function saveLobbyRulesPrefs(rules: MatchRules): void {
	try {
		const validated = validateMatchRules(rules);
		if (!validated.ok) {
			return;
		}
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validated.rules));
	} catch {
		/* ignore */
	}
}
