import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Box, Text } from '@mantine/core';

import { type HeroClass, HeroImage } from '@/entities/hero';

type DraftHeroCardProps = {
	hero: HeroClass;
	disabled: boolean;
	onOpen: (code: string) => void;
};

/**
 * Карточка героя в сетке draft: drag на ряд, клик — модалка.
 */
export const DraftHeroCard = ({ hero, disabled, onOpen }: DraftHeroCardProps) => {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: `hero:${hero.code}`,
		disabled,
		data: { type: 'hero', heroCode: hero.code, size: hero.size },
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		opacity: isDragging ? 0.55 : undefined,
		zIndex: isDragging ? 20 : undefined,
	};

	return (
		<button
			type="button"
			ref={setNodeRef}
			className="sylvenarr-torn-card"
			data-disabled={disabled ? 'true' : undefined}
			aria-disabled={disabled || undefined}
			style={style}
			{...(disabled ? {} : { ...listeners, ...attributes })}
			onClick={() => {
				if (!isDragging) {
					onOpen(hero.code);
				}
			}}
		>
			<Box className="sylvenarr-torn-card__portrait">
				<HeroImage code={hero.code} alt={hero.displayName} w="100%" h={72} radius={0} />
			</Box>
			<Text className="sylvenarr-torn-card__name" lineClamp={1}>
				{hero.displayName}
			</Text>
			<Text className="sylvenarr-torn-card__slots">слоты {hero.size}</Text>
		</button>
	);
};
