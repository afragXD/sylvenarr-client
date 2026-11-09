import { describe, expect, test } from 'bun:test';

import { classStartingPerks } from '@/entities/item';
import { getEffectMeta } from '@/features/battle/model/effectMeta';

import { getAbilityPreview } from './abilityPreview';
import { getHeroAbilities } from './heroAbilities';
import { getHeroBaseResists } from './heroBaseResists';

const slot = (code: string, n: number) =>
	getHeroAbilities(code, true).slots.find((item) => item.slot === n);

describe('статика героя совпадает со срезом CUT-2026-11-09', () => {
	test('перки: Суперкоммерсант у Титана, у Аббатисы реликвии', () => {
		expect(classStartingPerks('Abbess')).toEqual(['MISC', 'RELICS']);
		expect(classStartingPerks('Titan')).toEqual(['MISC', 'GRAND_MERCHANT']);
		expect(classStartingPerks('Abbess')).not.toContain('GRAND_MERCHANT');
	});

	test('резисты Титана, Драколича и Демона-принца', () => {
		const titan = Object.fromEntries(getHeroBaseResists('Titan').map((item) => [item.source, item]));
		expect(titan.STUN).toMatchObject({ value: 40, wardCharges: 1 });
		expect(titan.POLYMORPH).toMatchObject({ value: 25 });
		expect(titan.EARTH).toMatchObject({ value: 25 });
		expect(titan.HOLY).toMatchObject({ value: 25 });
		expect(titan.DEATH).toMatchObject({ value: 25 });

		const drake = Object.fromEntries(getHeroBaseResists('Dracolich').map((item) => [item.source, item]));
		expect(drake.STUN).toMatchObject({ value: 25 });
		expect(drake.AIR).toMatchObject({ value: 20 });

		const demon = Object.fromEntries(getHeroBaseResists('DemonLord').map((item) => [item.source, item]));
		expect(demon.MIND).toMatchObject({ value: 33, wardCharges: 1 });
		expect(demon.STUN).toMatchObject({ value: 25 });
		expect(demon.DEATH).toMatchObject({ value: 20 });
	});

	test('слоты Русалки, Титана, Аббатисы, Патриарха и Сглаза', () => {
		expect(slot('Mermaid', 1)?.body).toContain('2 МР');
		expect(slot('Mermaid', 1)?.body).not.toContain('точность');
		expect(slot('Mermaid', 4)?.title).toBe('Мыло слоад');
		expect(slot('Mermaid', 5)?.title).toBe('Восточный ветер');
		expect(slot('Titan', 4)?.body).toContain('КД 3');
		expect(slot('Titan', 4)?.body).not.toContain('Заряд');
		expect(slot('Titan', 5)?.title).toBe('Дрожь земли');
		expect(slot('Titan', 5)?.body).toContain('кроме невидимых');
		expect(slot('Titan', 5)?.body).not.toContain('охраной');
		expect(slot('DemonLord', 2)?.body).toContain('КД 2');
		expect(slot('Incub', 1)?.body).toContain('Золотой голем');
		expect(slot('Incub', 1)?.body).not.toContain('бес');
		expect(slot('Abbess', 1)?.body).toContain('3 МР');
		expect(slot('Patriarch', 5)?.title).toBe('Оковы любви');
		expect(slot('Specter', 3)?.body).toContain('волшебные оковы');
		expect(slot('Specter', 3)?.body).toContain('Жизнью');

		const eye = getAbilityPreview('Specter', 3, {
			lvl: 6,
			damage: 10,
			power: 10,
			targetMana: 10,
		});
		expect(eye?.some((part) => part.kind === 'text' && part.value.includes('40 Огонь'))).toBe(true);
	});

	test('карточки LOVE_SHACKLES, GALL и STUN_IMMUNE', () => {
		expect(getEffectMeta('LOVE_SHACKLES').label).toBe('Оковы любви');
		expect(getEffectMeta('GALL').mechanics).toContain('3 + ⌊L/5⌋');
		expect(getEffectMeta('GALL').exampleAtL).toContain('15 Вода');
		expect(getEffectMeta('GALL').exampleAtL).toContain('2 р.');
		expect(getEffectMeta('GALL').exampleAtL).not.toContain('20 Вода');
		expect(getEffectMeta('STUN_IMMUNE').mechanics).toContain('50%');
		expect(getEffectMeta('STUN_IMMUNE').mechanics).toContain('100%');
		expect(getEffectMeta('MAGIC_SHACKLES').mechanics).toContain('Жизнь');
	});
});
