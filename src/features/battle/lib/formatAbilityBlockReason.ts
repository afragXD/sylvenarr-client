/**
 * Нормализует disabledReason сервера под AC-5: «нет маны 6/8», «перезарядка 2».
 */
export function formatAbilityBlockReason(
	reason: string,
	mana?: number,
	maxMana?: number,
): string {
	const cd =
		reason.match(/перезарядка\s+(\d+)/i) ??
		reason.match(/кулдаун\s+(\d+)/i) ??
		reason.match(/cooldown\s+(\d+)/i);
	if (cd) {
		return `перезарядка ${cd[1]}`;
	}
	const manaNeed = reason.match(/нужно\s+(\d+)\s*мр/i) ?? reason.match(/нет\s+маны/i);
	if (manaNeed && typeof mana === 'number') {
		const cap = typeof maxMana === 'number' && maxMana > 0 ? maxMana : mana;
		return `нет маны ${mana}/${cap}`;
	}
	return reason;
}
