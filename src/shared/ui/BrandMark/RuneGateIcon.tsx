type RuneGateIconProps = {
	size?: number;
	className?: string;
};

/**
 * Линейный mark Rune Gate (арка ворот + руна S).
 */
export const RuneGateIcon = ({ size = 28, className }: RuneGateIconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 40 40"
		width={size}
		height={size}
		fill="none"
		aria-hidden="true"
		className={className}
		style={{ display: 'block', flexShrink: 0 }}
	>
		{/* Outer arch / gate */}
		<path
			d="M7 37V18.5C7 11.044 13.044 5 20.5 5S34 11.044 34 18.5V37"
			stroke="currentColor"
			strokeWidth="2.4"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		{/* Inner threshold */}
		<path
			d="M12.5 37V20c0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5v17"
			stroke="currentColor"
			strokeWidth="1.4"
			strokeLinecap="round"
			opacity="0.45"
		/>
		{/* Rune S */}
		<path
			d="M15.2 14.8c1.4-2.4 3.8-3.5 6.5-2.9 2.4.55 3.9 2.3 4 4.5.1 2.3-1.3 3.8-3.5 4.8l-4.6 2.1c-2.2 1-3.5 2.5-3.4 4.8.15 2.6 2.1 4.3 5.1 4.6 2.8.3 5-.75 6.4-2.9"
			stroke="currentColor"
			strokeWidth="2.2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);
