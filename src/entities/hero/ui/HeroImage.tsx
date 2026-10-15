import { Image } from '@mantine/core';
import type { SyntheticEvent } from 'react';

import {
	getHeroCharacterUrl,
	getHeroDefaultPortraitUrl,
	getHeroPortraitUrl,
} from '../lib/hero-images';

type HeroImageVariant = 'portrait' | 'character';

type HeroImageProps = {
	code: string;
	alt: string;
	variant?: HeroImageVariant;
	w?: number | string;
	h?: number | string;
	radius?: string | number;
};

/**
 * Картинка героя: character → portrait → DEFAULT.
 */
export const HeroImage = ({
	code,
	alt,
	variant = 'portrait',
	w = 40,
	h = 40,
	radius = 4,
}: HeroImageProps) => {
	const primary = variant === 'character' ? getHeroCharacterUrl(code) : getHeroPortraitUrl(code);

	const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
		const image = event.currentTarget;
		if (variant === 'character' && image.dataset.fallback !== 'portrait') {
			image.dataset.fallback = 'portrait';
			image.src = getHeroPortraitUrl(code);
			return;
		}
		if (image.dataset.fallback !== 'default') {
			image.dataset.fallback = 'default';
			image.src = getHeroDefaultPortraitUrl();
		}
	};

	return (
		<Image
			src={primary}
			alt={alt}
			w={w}
			h={h}
			radius={radius}
			fit="contain"
			bg="var(--app-surface)"
			onError={handleError}
		/>
	);
};
