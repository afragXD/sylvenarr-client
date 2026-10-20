const CYRILLIC: Record<string, string> = {
	а: 'a',
	б: 'b',
	в: 'v',
	г: 'g',
	д: 'd',
	е: 'e',
	ё: 'e',
	ж: 'zh',
	з: 'z',
	и: 'i',
	й: 'y',
	к: 'k',
	л: 'l',
	м: 'm',
	н: 'n',
	о: 'o',
	п: 'p',
	р: 'r',
	с: 's',
	т: 't',
	у: 'u',
	ф: 'f',
	х: 'h',
	ц: 'ts',
	ч: 'ch',
	ш: 'sh',
	щ: 'sch',
	ъ: '',
	ы: 'y',
	ь: '',
	э: 'e',
	ю: 'yu',
	я: 'ya',
};

/**
 * Транслит заголовка в URL-slug.
 */
export function slugify(input: string): string {
	const lower = input.trim().toLowerCase();
	let out = '';
	for (const char of lower) {
		if (CYRILLIC[char] !== undefined) {
			out += CYRILLIC[char];
		} else if (/[a-z0-9]/.test(char)) {
			out += char;
		} else if (/\s|-|_/.test(char)) {
			out += '-';
		}
	}
	return out.replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 120);
}
