import { apiFetchJson } from '@/shared/api/http';

import type {
	SquadPreset,
	SquadPresetListScope,
	SquadPresetWritePayload,
} from '../model/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const parsePreset = (data: unknown): SquadPreset => {
	if (!isRecord(data) || typeof data.id !== 'string' || typeof data.name !== 'string') {
		throw new Error('Некорректный ответ пресета');
	}
	return data as unknown as SquadPreset;
};

/**
 * Список пресетов (свои и/или глобальные).
 */
export async function fetchPresets(input?: {
	readonly teamSize?: number;
	readonly scope?: SquadPresetListScope;
}): Promise<SquadPreset[]> {
	const params = new URLSearchParams();
	if (typeof input?.teamSize === 'number') {
		params.set('teamSize', String(input.teamSize));
	}
	if (input?.scope) {
		params.set('scope', input.scope);
	}
	const query = params.toString();
	return apiFetchJson(
		`/presets${query ? `?${query}` : ''}`,
		undefined,
		(data) => {
			if (!Array.isArray(data)) {
				throw new Error('Некорректный список пресетов');
			}
			return data.map(parsePreset);
		},
		'Не удалось загрузить пресеты',
	);
}

/**
 * Создать пресет (global: true — только admin).
 */
export async function createPreset(payload: SquadPresetWritePayload): Promise<SquadPreset> {
	return apiFetchJson(
		'/presets',
		{ method: 'POST', body: JSON.stringify(payload) },
		parsePreset,
		'Не удалось создать пресет',
	);
}

/**
 * Обновить пресет.
 */
export async function updatePreset(
	id: string,
	payload: Partial<SquadPresetWritePayload>,
): Promise<SquadPreset> {
	return apiFetchJson(
		`/presets/${encodeURIComponent(id)}`,
		{ method: 'PATCH', body: JSON.stringify(payload) },
		parsePreset,
		'Не удалось обновить пресет',
	);
}

/**
 * Удалить пресет.
 */
export async function deletePreset(id: string): Promise<void> {
	await apiFetchJson(
		`/presets/${encodeURIComponent(id)}`,
		{ method: 'DELETE' },
		() => undefined,
		'Не удалось удалить пресет',
	);
}
