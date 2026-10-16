type YandexIconProps = {
	readonly size?: number;
};

/**
 * Знак Яндекса («Я») для OAuth-кнопки. viewBox как у эталона FAB.
 */
export const YandexIcon = ({ size = 20 }: YandexIconProps) => (
	<svg
		width={size}
		height={(size * 30) / 20}
		viewBox="0 0 20 30"
		xmlns="http://www.w3.org/2000/svg"
		role="img"
		aria-hidden
	>
		<path
			fill="currentColor"
			d="M14.6559 4.01552H12.3339C8.07675 4.01552 5.84078 6.15157 5.84078 9.3126C5.84078 12.9011 7.3888 14.567 10.5709 16.7031L13.1938 18.4545L5.62581 29.6895H0L6.78673 19.6506C2.87365 16.8737 0.680533 14.1826 0.680533 9.61166C0.680533 3.88751 4.67968 0 12.2909 0H19.859V29.6895H14.6559V4.01552Z"
		/>
	</svg>
);
