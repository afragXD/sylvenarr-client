import { describe, expect, test } from 'bun:test';

import { tierRarity, tierRarityTitle } from './tierRarity';

describe('tierRarity', () => {
	test('1–2 обычные, без своего цвета', () => {
		expect(tierRarity(1)).toEqual({ name: 'Обычный' });
		expect(tierRarity(2).color).toBeUndefined();
	});

	test('3–4 необычные, зелёные', () => {
		expect(tierRarity(3)).toEqual({ name: 'Необычный', color: '#7FA86A' });
		expect(tierRarity(4).color).toBe('#7FA86A');
	});

	test('5–6 редкие, синие', () => {
		expect(tierRarity(5).name).toBe('Редкий');
		expect(tierRarity(6).color).toBe('#6AA4C8');
	});

	test('7–8 эпические, фиолетовые', () => {
		expect(tierRarity(7)).toEqual({ name: 'Эпический', color: '#A98BD4' });
		expect(tierRarity(8).color).toBe('#A98BD4');
	});

	test('9 легендарный, оранжевый', () => {
		expect(tierRarity(9)).toEqual({ name: 'Легендарный', color: '#E08A3C' });
		expect(tierRarityTitle(9)).toBe('Легендарный, тир 9');
	});
});
