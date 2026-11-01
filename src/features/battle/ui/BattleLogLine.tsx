import { type ReactNode } from 'react';

import styles from './BattleLogLine.module.css';

type LogDamageSrc =
	| 'fire'
	| 'holy'
	| 'water'
	| 'death'
	| 'weapon'
	| 'air'
	| 'earth'
	| 'arrows'
	| 'mind';

/** `(42)⟦FIRE⟧` — маркер источника; без маркера — эвристика. */
const DAMAGE_MARKED_RE = /(\()(-?\d+)(\))(?:⟦([A-Z_]+)⟧)?/g;
const SERVICE_TAG_RE = /⟦[A-Z_]+⟧/g;

const SOURCE_TO_SRC: Record<string, LogDamageSrc> = {
	FIRE: 'fire',
	HOLY: 'holy',
	WATER: 'water',
	DEATH: 'death',
	WEAPON: 'weapon',
	DEFAULT: 'weapon',
	AIR: 'air',
	EARTH: 'earth',
	ARROWS: 'arrows',
	MIND: 'mind',
	STUN: 'weapon',
	DESTROYARMOR: 'weapon',
	POLYMORPH: 'weapon',
	IMITATION: 'weapon',
	MOVEMENT: 'weapon',
	FINALSTRIKE: 'death',
	LOWERINGLEVEL: 'mind',
};

function stripServiceTags(text: string): string {
	return text.replace(SERVICE_TAG_RE, '');
}

function detectLogDamageSrc(line: string): LogDamageSrc {
	const lower = line.toLowerCase();
	if (/поджог|огн|плам|горит|burning|fire/.test(lower)) {
		return 'fire';
	}
	if (/свят|holy|копь[её] солнца|сакрал/.test(lower)) {
		return 'holy';
	}
	if (/вод|слиз|шлёп|шлеп|water/.test(lower)) {
		return 'water';
	}
	if (/яд|смерт|отрав|death|poison|bleeding|желч/.test(lower)) {
		return 'death';
	}
	if (/молн|разряд|воздух|air/.test(lower)) {
		return 'air';
	}
	if (/земл|ядр|earth|корн/.test(lower)) {
		return 'earth';
	}
	if (/стрел|болт|пращ|лук|arrows/.test(lower)) {
		return 'arrows';
	}
	return 'weapon';
}

/**
 * Строка журнала боя без служебных тегов ⟦WEAPON⟧ (AC-6 / WG-023).
 */
export function renderBattleLogLine(line: string): ReactNode {
	const cleaned = stripServiceTags(line);
	if (/^——\s*ХОД:/u.test(cleaned) || /^——\s*ход:/iu.test(cleaned)) {
		return <div className={styles.logTurn}>{cleaned}</div>;
	}
	if (
		cleaned.length > 1 &&
		!/\(\s*-?\d+\s*\)/.test(cleaned) &&
		!/^——/.test(cleaned) &&
		cleaned === cleaned.toLocaleUpperCase('ru-RU') &&
		/[A-ZА-ЯЁ]/.test(cleaned)
	) {
		return <div className={styles.logActionCaps}>{cleaned}</div>;
	}
	const fallbackSrc = detectLogDamageSrc(cleaned);
	const parts: ReactNode[] = [];
	let last = 0;
	let match: RegExpExecArray | null;
	DAMAGE_MARKED_RE.lastIndex = 0;
	while ((match = DAMAGE_MARKED_RE.exec(cleaned)) !== null) {
		if (match.index > last) {
			parts.push(stripServiceTags(cleaned.slice(last, match.index)));
		}
		const tagged = match[4];
		const src = (tagged && SOURCE_TO_SRC[tagged]) || fallbackSrc;
		parts.push(
			<span key={`${match.index}-${match[2]}`} className={styles.logDmg} data-src={src}>
				{`(${match[2]})`}
			</span>,
		);
		last = match.index + match[0].length;
	}
	if (last < cleaned.length) {
		parts.push(stripServiceTags(cleaned.slice(last)));
	}
	return <div className={styles.logLine}>{parts.length > 0 ? parts : cleaned}</div>;
}
