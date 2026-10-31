import { describe, expect, test } from 'bun:test';

import { isSafeAppPath, sanitizeAuthRedirect } from './authRedirect';

describe('authRedirect', () => {
	test('accepts same-origin paths', () => {
		expect(isSafeAppPath('/lobby')).toBe(true);
		expect(isSafeAppPath('/lobby/abc-123')).toBe(true);
		expect(isSafeAppPath('/matches/x?tab=1')).toBe(true);
		expect(sanitizeAuthRedirect('/lobby/abc')).toBe('/lobby/abc');
	});

	test('rejects open redirects', () => {
		const evil = [
			'/\\example.com',
			'%2F%5Cexample.com',
			'//example.com',
			'https://example.com',
			'/%2F%2Fexample.com',
			'javascript:alert(1)',
			'\\\\example.com',
			'/\\/example.com',
		];
		for (const path of evil) {
			expect(isSafeAppPath(path)).toBe(false);
			expect(sanitizeAuthRedirect(path)).toBe('/');
		}
	});
});
