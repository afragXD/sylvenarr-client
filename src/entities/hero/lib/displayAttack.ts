/**
 * Отображаемая «атака/урон» в каталоге и превью: max(атака, сила магии).
 * Боевые формулы навыков не меняет.
 */
export function displayAttack(damage: number, power: number): number {
	return Math.max(damage, power);
}
