/** Избранные герои витрины главной (порядок пользователя). */
export const FEATURED_HERO_CODES = [
	'Archlich',
	'Assassin',
	'Witch',
	'BeerElemental',
	'OrcKing',
	'Mermaid',
] as const;

export type FeaturedHeroCode = (typeof FEATURED_HERO_CODES)[number];
