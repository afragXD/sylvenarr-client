type YandexIconProps = {
	readonly size?: number;
};

/**
 * Знак Яндекса для OAuth-кнопки.
 */
export const YandexIcon = ({ size = 28 }: YandexIconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden
	>
		<path
			fill="#FC3F1D"
			d="M12.9 2.4H9.55c-2.85 0-4.75 1.85-4.75 4.55 0 2.35 1.15 3.85 3.35 5.35l.45.3L4.2 21.6h2.95l3.85-6.85h.9V21.6h2.7V2.4h-1.7Zm-1.55 8.95c-1.55-1.05-2.35-2-2.35-3.55 0-1.55 1.05-2.5 2.7-2.5h1.2v6.05h-1.55Z"
		/>
	</svg>
);
