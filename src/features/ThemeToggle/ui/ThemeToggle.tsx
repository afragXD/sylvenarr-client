import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { Moon, Sun } from 'lucide-react';
import type { MouseEvent } from 'react';

import { animateThemeTransition } from '../lib/animateThemeTransition';

export const ThemeToggle = () => {
	const { setColorScheme } = useMantineColorScheme();
	const computedColorScheme = useComputedColorScheme('dark');

	const isDark = computedColorScheme === 'dark';
	const nextScheme = isDark ? 'light' : 'dark';
	const label = isDark ? 'Светлая тема' : 'Тёмная тема';

	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		// Центр кнопки надёжнее clientX/Y на touch (нулевые/сдвинутые координаты)
		const rect = event.currentTarget.getBoundingClientRect();
		const x = rect.left + rect.width / 2;
		const y = rect.top + rect.height / 2;

		animateThemeTransition(x, y, nextScheme === 'dark', () => {
			setColorScheme(nextScheme);
		});
	};

	return (
		<ActionIcon
			variant="default"
			size={32}
			radius={0}
			aria-label={label}
			title={label}
			onClick={handleClick}
		>
			{isDark ? <Sun size={16} /> : <Moon size={16} />}
		</ActionIcon>
	);
};
