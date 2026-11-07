import { describe, expect, test } from 'bun:test';

import { STATIC_BASE_URL } from '@/shared/constants';

import { getItemIconUrl } from './item-images';

describe('getItemIconUrl', () => {
	test('builds Angie items path for numeric code', () => {
		expect(getItemIconUrl(655)).toBe(`${STATIC_BASE_URL}/static/images/items/655.webp`);
		expect(getItemIconUrl(2137)).toBe(`${STATIC_BASE_URL}/static/images/items/2137.webp`);
	});
});
