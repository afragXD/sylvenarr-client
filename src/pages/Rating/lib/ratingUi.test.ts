import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, test } from 'bun:test';

import type { RatingRow } from '@/entities/rating';

import {
	THRESHOLD_LINE_COLOR,
	THRESHOLD_LINE_WIDTH,
	pickVisibleObserveTarget,
	shouldShowShowMeLink,
	thresholdInsertIndex,
} from './ratingUi';

const row = (playerId: string, pts: number): RatingRow => ({
	playerId,
	displayName: playerId,
	avatarUrl: null,
	pts,
	wins: 0,
	losses: 0,
	draws: 0,
	game: 0,
});

describe('ratingUi threshold (AC-4)', () => {
	test('одна линия 1px цвета #CBB48C', () => {
		expect(THRESHOLD_LINE_WIDTH).toBe('1px');
		expect(THRESHOLD_LINE_COLOR.toUpperCase()).toBe('#CBB48C');
		const css = readFileSync(join(import.meta.dir, '../ui/RatingPage.module.css'), 'utf8');
		const block = css.slice(css.indexOf('.thresholdRow td'), css.indexOf('.thresholdLabel'));
		expect(block).toContain('border-top: 1px solid #cbb48c');
		expect(block).toMatch(/border-bottom:\s*none/i);
		expect(block).not.toMatch(/border-bottom:\s*1px solid/i);
	});

	test('смешанный список — разделитель перед первым <1500', () => {
		const items = [row('a', 1600), row('b', 1500), row('c', 1400)];
		expect(thresholdInsertIndex(items)).toBe(2);
	});

	test('все ≥1500 — разделитель внизу', () => {
		const items = [row('a', 1600), row('b', 1500)];
		expect(thresholdInsertIndex(items)).toBe(2);
	});

	test('все <1500 — разделитель вверху', () => {
		const items = [row('a', 1400), row('b', 1200)];
		expect(thresholdInsertIndex(items)).toBe(0);
	});
});

describe('ratingUi show-me (AC-5)', () => {
	test('строка вне экрана → ссылка есть', () => {
		expect(shouldShowShowMeLink({ myRank: 9, rowVisible: false })).toBe(true);
	});

	test('строка в экране → ссылки нет', () => {
		expect(shouldShowShowMeLink({ myRank: 9, rowVisible: true })).toBe(false);
	});

	test('гость (нет места) → ссылки нет', () => {
		expect(shouldShowShowMeLink({ myRank: 0, rowVisible: false })).toBe(false);
	});
});

describe('ratingUi pickVisibleObserveTarget', () => {
	test('пропускает display:none и берёт видимый', () => {
		const hidden = {
			getClientRects: () => [{ width: 10, height: 10 }],
		} as unknown as Element;
		const visible = {
			getClientRects: () => [{ width: 10, height: 10 }],
		} as unknown as Element;

		const original = globalThis.getComputedStyle;
		globalThis.getComputedStyle = ((el: Element) =>
			({
				display: el === hidden ? 'none' : 'table-row',
				visibility: 'visible',
			}) as CSSStyleDeclaration) as typeof getComputedStyle;

		try {
			expect(pickVisibleObserveTarget([hidden, visible])).toBe(visible);
			expect(pickVisibleObserveTarget([hidden])).toBeNull();
		} finally {
			globalThis.getComputedStyle = original;
		}
	});
});
