import { apiFetchJson } from '@/shared/api/http';

import type { ItemBrief, PerkBrief } from '../model/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const parseItem = (data: unknown): ItemBrief | null => {
	if (!isRecord(data) || typeof data.code !== 'number' || typeof data.name !== 'string') {
		return null;
	}
	return data as unknown as ItemBrief;
};

const parsePerk = (data: unknown): PerkBrief | null => {
	if (!isRecord(data) || typeof data.id !== 'string' || typeof data.name !== 'string') {
		return null;
	}
	return data as unknown as PerkBrief;
};

/**
 * Публичный каталог предметов.
 */
export async function fetchItems(): Promise<ItemBrief[]> {
	return apiFetchJson(
		'/items',
		undefined,
		(data) => {
			if (!isRecord(data) || !Array.isArray(data.items)) {
				throw new Error('Некорректный список предметов');
			}
			return data.items.map(parseItem).filter((item): item is ItemBrief => item !== null);
		},
		'Не удалось загрузить предметы',
	);
}

/**
 * Публичный каталог перков.
 */
export async function fetchPerks(): Promise<PerkBrief[]> {
	return apiFetchJson(
		'/perks',
		undefined,
		(data) => {
			if (!isRecord(data) || !Array.isArray(data.items)) {
				throw new Error('Некорректный список перков');
			}
			return data.items.map(parsePerk).filter((perk): perk is PerkBrief => perk !== null);
		},
		'Не удалось загрузить перки',
	);
}
