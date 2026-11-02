import { describe, expect, test } from 'bun:test';

import { LEVEL_SLIDER_DEFAULTS, buildLevelMarks } from './LevelSlider';

describe('LevelSlider marks', () => {
	test('defaults совпадают с лобби 1–30', () => {
		expect(LEVEL_SLIDER_DEFAULTS).toEqual({ min: 1, max: 30, step: 1 });
	});

	test('buildLevelMarks 1–30 → каждые 5', () => {
		expect(buildLevelMarks(1, 30).map((mark) => mark.value)).toEqual([
			1, 5, 10, 15, 20, 25, 30,
		]);
	});
});
