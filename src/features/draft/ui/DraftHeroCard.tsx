import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Box, Text, Tooltip } from '@mantine/core';

import { type HeroClass, HeroImage } from '@/entities/hero';

import styles from './DraftHeroCard.module.css';

const ROMAN = ['', 'I', 'II', 'III', 'IV'] as const;

/**
 * Размер героя римской цифрой: 1 → I, 2 → II.
 */
export const sizeToRoman = (size: number): string => ROMAN[size] ?? String(size);

/**
 * Текст подсказки о занимаемых слотах.
 */
export const slotsHint = (size: number): string =>
	size === 1 ? 'Занимает один слот в отряде' : `Занимает ${size} слота в отряде`;

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
			className={styles.card}
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
			<Box className={styles.portrait}>
				<HeroImage
					code={hero.code}
					alt={hero.displayName}
					w="100%"
					h="100%"
					radius={0}
					fit="cover"
					bg="transparent"
				/>
				<Tooltip
					label={slotsHint(hero.size)}
					withArrow
					events={{ hover: true, focus: true, touch: true }}
				>
					<span className={styles.slots} role="img" aria-label={slotsHint(hero.size)}>
						{sizeToRoman(hero.size)}
					</span>
				</Tooltip>
			</Box>
			<Text className={styles.name} lineClamp={1}>
				{hero.displayName}
			</Text>
		</button>
	);
};
