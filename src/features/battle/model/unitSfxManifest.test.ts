import { describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { UNIT_SFX } from './unitSfxManifest';

const sfxRoot = resolve(import.meta.dir, '../../../../../angie/static/sfx/heroes');

describe('UNIT_SFX', () => {
	test.skipIf(!existsSync(sfxRoot))('every stem exists on the static volume', () => {
		const missing: string[] = [];
		for (const [code, entry] of Object.entries(UNIT_SFX)) {
			const stems = [...Object.values(entry.slots), entry.death].filter((stem): stem is string =>
				Boolean(stem),
			);
			for (const stem of stems) {
				for (const ext of ['webm', 'mp3']) {
					if (!existsSync(join(sfxRoot, code, `${stem}.${ext}`))) {
						missing.push(`${code}/${stem}.${ext}`);
					}
				}
			}
		}
		expect(missing).toEqual([]);
	});
});
