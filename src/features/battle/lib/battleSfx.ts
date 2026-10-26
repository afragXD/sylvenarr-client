import type { Howl as HowlInstance } from 'howler';
import { useSyncExternalStore } from 'react';

import type { BattleSfxEvent } from '@/entities/match';
import { STATIC_BASE_URL } from '@/shared/constants';

import { UNIT_SFX } from '../model/unitSfxManifest';

const MUTED_KEY = 'sylvenarr.battleSfx.muted';
const VOLUME_KEY = 'sylvenarr.battleSfx.volume';
const DEFAULT_VOLUME = 0.7;
/** Пауза перед звуком гибели, чтобы он не сливался с ударом. */
const DEATH_DELAY_MS = 350;

export type BattleSfxSettings = {
	muted: boolean;
	volume: number;
};

const SERVER_SETTINGS: BattleSfxSettings = { muted: false, volume: DEFAULT_VOLUME };

function clampVolume(value: number): number {
	return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : DEFAULT_VOLUME;
}

function readSettings(): BattleSfxSettings {
	if (typeof window === 'undefined') {
		return SERVER_SETTINGS;
	}
	try {
		const rawVolume = window.localStorage.getItem(VOLUME_KEY);
		return {
			muted: window.localStorage.getItem(MUTED_KEY) === '1',
			volume: rawVolume === null ? DEFAULT_VOLUME : clampVolume(Number(rawVolume)),
		};
	} catch {
		return SERVER_SETTINGS;
	}
}

let settings: BattleSfxSettings = SERVER_SETTINGS;
let settingsLoaded = false;
const listeners = new Set<() => void>();

export function getBattleSfxSettings(): BattleSfxSettings {
	if (!settingsLoaded && typeof window !== 'undefined') {
		settings = readSettings();
		settingsLoaded = true;
	}
	return settings;
}

function writeSettings(next: BattleSfxSettings): void {
	settings = next;
	settingsLoaded = true;
	try {
		window.localStorage.setItem(MUTED_KEY, next.muted ? '1' : '0');
		window.localStorage.setItem(VOLUME_KEY, String(next.volume));
	} catch {
		/* приватный режим / квота — настройки живут до перезагрузки */
	}
	void loadHowler().then(({ Howler }) => {
		Howler.volume(next.volume);
		Howler.mute(next.muted);
	});
	for (const listener of listeners) {
		listener();
	}
}

export function setBattleSfxMuted(muted: boolean): void {
	writeSettings({ ...getBattleSfxSettings(), muted });
}

/** Громкость 0…1. Ненулевая громкость снимает mute. */
export function setBattleSfxVolume(volume: number): void {
	const next = clampVolume(volume);
	writeSettings({ muted: next === 0, volume: next });
}

function subscribe(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function useBattleSfxSettings(): BattleSfxSettings {
	return useSyncExternalStore(subscribe, getBattleSfxSettings, () => SERVER_SETTINGS);
}

type HowlerModule = typeof import('howler');
let howlerPromise: Promise<HowlerModule> | null = null;

function loadHowler(): Promise<HowlerModule> {
	if (!howlerPromise) {
		howlerPromise = import('howler').then((mod) => {
			const current = getBattleSfxSettings();
			mod.Howler.volume(current.volume);
			mod.Howler.mute(current.muted);
			return mod;
		});
	}
	return howlerPromise;
}

/**
 * URL звука героя через Angie:
 * `{VITE_STATIC_BASE_URL}/static/sfx/heroes/{code}/{stem}.{ext}`
 */
export function getUnitSfxUrl(code: string, stem: string, ext: 'webm' | 'mp3'): string {
	return `${STATIC_BASE_URL}/static/sfx/heroes/${code}/${stem}.${ext}`;
}

const howls = new Map<string, HowlInstance>();

async function getHowl(code: string, stem: string): Promise<HowlInstance> {
	const key = `${code}/${stem}`;
	const cached = howls.get(key);
	if (cached) {
		return cached;
	}
	const { Howl } = await loadHowler();
	const howl = new Howl({
		src: [getUnitSfxUrl(code, stem, 'webm'), getUnitSfxUrl(code, stem, 'mp3')],
		preload: true,
	});
	howls.set(key, howl);
	return howl;
}

function stemsFor(code: string): string[] {
	const entry = UNIT_SFX[code];
	if (!entry) {
		return [];
	}
	return [...Object.values(entry.slots), entry.death].filter((stem): stem is string =>
		Boolean(stem),
	);
}

/** Подгружает звуки классов, стоящих на поле. */
export function preloadUnitSfx(codes: Iterable<string>): void {
	if (typeof window === 'undefined') {
		return;
	}
	for (const code of new Set(codes)) {
		for (const stem of stemsFor(code)) {
			void getHowl(code, stem);
		}
	}
}

function stemForEvent(event: BattleSfxEvent): string | undefined {
	const entry = UNIT_SFX[event.heroClassCode];
	if (!entry) {
		return undefined;
	}
	if (event.kind === 'death') {
		return entry.death;
	}
	return event.slot ? entry.slots[event.slot] : undefined;
}

/** Проигрывает пачку новых событий боя по порядку seq. */
export function playBattleSfxEvents(events: readonly BattleSfxEvent[]): void {
	if (typeof window === 'undefined' || getBattleSfxSettings().muted) {
		return;
	}
	const ordered = [...events].sort((a, b) => a.seq - b.seq);
	let deathOffset = ordered.some((event) => event.kind === 'ability') ? DEATH_DELAY_MS : 0;
	for (const event of ordered) {
		const stem = stemForEvent(event);
		if (!stem) {
			continue;
		}
		const delay = event.kind === 'death' ? deathOffset : 0;
		if (event.kind === 'death') {
			deathOffset += DEATH_DELAY_MS;
		}
		const play = () => {
			void getHowl(event.heroClassCode, stem).then((howl) => {
				howl.play();
			});
		};
		if (delay > 0) {
			window.setTimeout(play, delay);
		} else {
			play();
		}
	}
}

/** Разблокирует Web Audio Howler после жеста пользователя (autoplay policy). */
export function unlockBattleSfx(): void {
	void loadHowler().then(({ Howler }) => {
		const ctx = Howler.ctx;
		if (ctx && ctx.state === 'suspended') {
			void ctx.resume().catch(() => undefined);
		}
	});
}
