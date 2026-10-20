import type { ResistBrief } from '@/entities/match';

/**
 * Описания источников урона/воздействий для подсказок по резистам и вардам.
 * Ключи — DamageSource сервера (damageSources.ts).
 */
const SOURCE_DESCRIPTIONS: Record<string, string> = {
	DEFAULT: 'Чистый урон без стихии.',
	WEAPON: 'Урон ближнего оружия и когтей.',
	ARROWS: 'Урон стрелами, болтами и пулями.',
	MIND: 'Воздействие на разум: страх, контроль, паралич.',
	DEATH: 'Магия смерти и некромантия.',
	FIRE: 'Огненный урон и поджоги.',
	AIR: 'Урон воздуха и молний.',
	EARTH: 'Урон земли и корней.',
	WATER: 'Урон воды и льда.',
	HOLY: 'Сакральный урон, опасен для нежити.',
	STUN: 'Оглушение и паралич.',
	DESTROYARMOR: 'Разрушение брони.',
	POLYMORPH: 'Превращение в другое существо.',
	IMITATION: 'Копирование и фантомы.',
	MOVEMENT: 'Перемещение и смена рядов.',
	FINALSTRIKE: 'Порог смерти: шанс пережить смертельный урон, оставшись с 1 ОЗ.',
	LOWERINGLEVEL: 'Понижение и кража уровней.',
};

/** Описание источника для tooltip/подсказки; null если источник неизвестен. */
export function resistSourceDescription(source: string): string | null {
	return SOURCE_DESCRIPTIONS[source] ?? null;
}

/**
 * Только % / иммунитет (без варда).
 */
export function formatResistPercent(resist: ResistBrief): string {
	if (resist.immune) {
		return 'Иммунитет';
	}
	if (resist.value > 0) {
		return `${resist.value}%`;
	}
	if (resist.value < 0) {
		return `−${Math.abs(resist.value)}%`;
	}
	return '0%';
}

/** «Вард×N» или null, если зарядов нет. */
export function formatWardCharges(resist: ResistBrief): string | null {
	if (resist.wardCharges == null || resist.wardCharges <= 0) {
		return null;
	}
	return `Вард×${resist.wardCharges}`;
}

/**
 * Короткое значение для совместимости: процент или вард (не склеивает оба).
 * Предпочтительно formatResistPercent / formatWardCharges.
 */
export function formatResistValue(resist: ResistBrief): string {
	const ward = formatWardCharges(resist);
	if (resist.immune || resist.value !== 0) {
		return formatResistPercent(resist);
	}
	return ward ?? '0%';
}

/**
 * Полное описание строкой: «Вард: поглощает 1 удар от «Оружие»».
 */
export function describeResist(resist: ResistBrief): string {
	const parts: string[] = [];
	if (resist.immune) {
		parts.push(`Иммунитет к «${resist.label}» — урон не проходит.`);
	}
	if (resist.wardCharges != null && resist.wardCharges > 0) {
		parts.push(
			`Вард: поглощает ${resist.wardCharges} ${plural(resist.wardCharges)} от «${resist.label}».`,
		);
	}
	if (resist.value > 0) {
		parts.push(`Снижает урон от «${resist.label}» на ${resist.value}%.`);
	} else if (resist.value < 0) {
		parts.push(`Уязвимость: +${Math.abs(resist.value)}% урона от «${resist.label}».`);
	}
	if (parts.length === 0) {
		return `Нет особой защиты от «${resist.label}».`;
	}
	const sourceDescription = resistSourceDescription(resist.source);
	return sourceDescription ? `${parts.join(' ')} ${sourceDescription}` : parts.join(' ');
}

function plural(count: number): string {
	const mod10 = count % 10;
	const mod100 = count % 100;
	if (mod10 === 1 && mod100 !== 11) {
		return 'удар';
	}
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
		return 'удара';
	}
	return 'ударов';
}

/** Варды юнита для бейджей рядом с эффектами. */
export function listWards(resists: ResistBrief[] | undefined): ResistBrief[] {
	return (resists ?? []).filter((resist) => resist.wardCharges != null && resist.wardCharges > 0);
}

/** Сопротивления с ненулевым % или иммунитетом (вард сам по себе не считается). */
export function listPercentResists(resists: ResistBrief[] | undefined): ResistBrief[] {
	return (resists ?? []).filter((resist) => resist.immune || resist.value !== 0);
}
