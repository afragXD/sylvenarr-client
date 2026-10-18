/** Классы-формы превращения: не в драфте, но и не призывы. */
const TRANSFORM_FORM_CODES = new Set(['Werewolf']);

/**
 * Боевая форма (Marauder→Werewolf и т.п.), а не саммон.
 */
export function isTransformForm(code: string): boolean {
	return TRANSFORM_FORM_CODES.has(code);
}
