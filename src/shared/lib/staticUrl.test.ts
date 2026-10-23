import { describe, expect, test } from 'bun:test';

import { getSceneUrl, resolveStaticUrl } from './staticUrl';

describe('resolveStaticUrl', () => {
	test('prefixes /static/ paths', () => {
		expect(resolveStaticUrl('/static/images/scenes/battle.webp')).toBe(
			`${import.meta.env.VITE_STATIC_BASE_URL}/static/images/scenes/battle.webp`,
		);
	});

	test('maps legacy /scenes/ to static images', () => {
		expect(resolveStaticUrl('/scenes/draft.webp')).toBe(
			`${import.meta.env.VITE_STATIC_BASE_URL}/static/images/scenes/draft.webp`,
		);
	});

	test('leaves absolute http urls', () => {
		expect(resolveStaticUrl('https://cdn.example/x.webp')).toBe('https://cdn.example/x.webp');
	});

	test('getSceneUrl builds scenes path', () => {
		expect(getSceneUrl('battle.webp')).toBe(
			`${import.meta.env.VITE_STATIC_BASE_URL}/static/images/scenes/battle.webp`,
		);
	});
});
