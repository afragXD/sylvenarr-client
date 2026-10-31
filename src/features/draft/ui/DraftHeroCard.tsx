import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Box, Text, Tooltip } from '@mantine/core';
import type { KeyboardEvent, MouseEvent } from 'react';

import { type HeroClass, HeroImage } from '@/entities/hero';

import styles from './DraftHeroCard.module.css';

const ROMAN = ['', 'I', 'II', 'III', 'IV'] as const;
const ROW_FRONT = 0;
const ROW_BACK = 1;

/**
 * Размер героя римской цифрой: 1 → I, 2 → II.
 */
export const sizeToRoman = (size: number): string => ROMAN[size] ?? String(size);

/**
 * Текст подсказки о занимаемых слотах.
 */
export const slotsHint = (size: number): string =>
	size === 1 ? 'Занимает 1 слот' : `Занимает ${size} слота`;

type DraftHeroCardProps = {
	hero: HeroClass;
	disabled: boolean;
	/** Почему карточка заблокирована — показывается в тултипе. */
	disabledReason?: string;
	/** Уже выбран в отряде текущего игрока. */
	selected?: boolean;
	/** Карточка в фокусе квоты (проекция слотов). */
	focused?: boolean;
	onFocusHero?: (code: string | null) => void;
	onOpen: (code: string) => void;
	onPickRow: (heroCode: string, row: number) => void;
};

/**
 * Карточка героя в draft: клик/Enter и кнопки рядов; drag — ускорение.
 */
export const DraftHeroCard = ({
	hero,
	disabled,
	disabledReason,
	selected = false,
	focused = false,
	onFocusHero,
	onOpen,
	onPickRow,
}: DraftHeroCardProps) => {
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

	const reason = disabled ? disabledReason : undefined;
	const slotsLabel = slotsHint(hero.size);

	const handlePick = (row: number, event: MouseEvent | KeyboardEvent) => {
		event.stopPropagation();
		event.preventDefault();
		if (disabled || isDragging) {
			return;
		}
		onPickRow(hero.code, row);
	};

	const handleCardKeyDown = (event: KeyboardEvent<HTMLFieldSetElement>) => {
		// Только когда фокус на самой карточке — не перехватывать Enter/Space у кнопок ряда.
		if (disabled || event.target !== event.currentTarget) {
			return;
		}
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onPickRow(hero.code, ROW_FRONT);
		}
	};

	const card = (
		<fieldset
			ref={setNodeRef}
			className={styles.card}
			style={style}
			data-disabled={disabled ? 'true' : undefined}
			data-selected={selected ? 'true' : undefined}
			data-focused={focused ? 'true' : undefined}
			data-slots={hero.size}
			data-hero-name={hero.displayName}
			aria-label={`${hero.displayName}, ${slotsLabel}${selected ? ', выбран' : ''}${disabled ? ', недоступен' : ''}`}
			tabIndex={disabled ? -1 : 0}
			onFocus={() => onFocusHero?.(hero.code)}
			onBlur={() => onFocusHero?.(null)}
			onKeyDown={handleCardKeyDown}
		>
			<div className={styles.media}>
				{/* Drag только на портрет+имя — бейдж слотов снаружи, иначе Tooltip не ловит hover. */}
				<div className={styles.dragSurface} {...(disabled ? {} : { ...listeners, ...attributes })}>
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
					</Box>
					<Text className={styles.name} lineClamp={1}>
						{hero.displayName}
					</Text>
				</div>
				<Tooltip
					label={slotsLabel}
					withArrow
					withinPortal
					position="top"
					openDelay={80}
					zIndex={400}
					events={{ hover: true, focus: true, touch: true }}
				>
					<button type="button" className={styles.slots} aria-label={slotsLabel}>
						{sizeToRoman(hero.size)}
					</button>
				</Tooltip>
			</div>
			<div className={styles.actions}>
				<button
					type="button"
					className={styles.rowBtn}
					disabled={disabled}
					onClick={(event) => handlePick(ROW_FRONT, event)}
				>
					В передний ряд
				</button>
				<button
					type="button"
					className={styles.rowBtn}
					disabled={disabled}
					onClick={(event) => handlePick(ROW_BACK, event)}
				>
					В задний ряд
				</button>
				<button
					type="button"
					className={styles.infoBtn}
					onClick={(event) => {
						event.stopPropagation();
						onOpen(hero.code);
					}}
				>
					Справка
				</button>
			</div>
		</fieldset>
	);

	if (!reason) {
		return card;
	}

	return (
		<Tooltip
			label={reason}
			withArrow
			withinPortal
			openDelay={150}
			events={{ hover: true, focus: true, touch: true }}
		>
			{card}
		</Tooltip>
	);
};
