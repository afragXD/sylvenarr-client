/**
 * Русское склонение для «N класс(а/ов)» (AC-10: число из API).
 */
export const formatHeroClassCount = (n: number): string => {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod100 >= 11 && mod100 <= 14) {
		return `${n} классов`;
	}
	if (mod10 === 1) {
		return `${n} класс`;
	}
	if (mod10 >= 2 && mod10 <= 4) {
		return `${n} класса`;
	}
	return `${n} классов`;
};
