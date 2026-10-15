import { type CSSVariablesResolver, createTheme, type MantineColorsTuple } from '@mantine/core';

const brand: MantineColorsTuple = [
	'#eef3f7',
	'#d5e1eb',
	'#a9c3d6',
	'#7ba4bf',
	'#568aab',
	'#3f789c',
	'#2F5F7A',
	'#275068',
	'#1f4054',
	'#163040',
];

const accent: MantineColorsTuple = [
	'#eef8f4',
	'#d4eee3',
	'#a8dcc6',
	'#79c9a7',
	'#54b98f',
	'#3daa7d',
	'#2F8F68',
	'#277857',
	'#1f6046',
	'#164834',
];

export const theme = createTheme({
	primaryColor: 'brand',
	primaryShade: { light: 6, dark: 4 },
	colors: {
		brand,
		accent,
	},
	fontFamily: 'DM Sans, system-ui, sans-serif',
	fontFamilyMonospace: 'JetBrains Mono, ui-monospace, monospace',
	headings: {
		fontFamily: 'DM Sans, system-ui, sans-serif',
		fontWeight: '700',
	},
	defaultRadius: 'md',
	other: {
		appBgLight: '#F5F7F9',
		appBgDark: '#101418',
		appSurfaceLight: '#FFFFFF',
		appSurfaceDark: '#1A1F24',
		appSurfaceMutedLight: '#E8EDF1',
		appSurfaceMutedDark: '#242A31',
		appTextLight: '#142018',
		appTextDark: '#E8EEF2',
		appTextMutedLight: '#5C6B75',
		appTextMutedDark: '#8A97A1',
		appBorderLight: '#D0D8E0',
		appBorderDark: '#2E363F',
	},
});

export const cssVariablesResolver: CSSVariablesResolver = (theme) => ({
	variables: {},
	light: {
		'--mantine-color-body': theme.other.appBgLight,
		'--mantine-color-text': theme.other.appTextLight,
		'--app-surface': theme.other.appSurfaceLight,
		'--app-surface-muted': theme.other.appSurfaceMutedLight,
		'--app-text': theme.other.appTextLight,
		'--app-text-muted': theme.other.appTextMutedLight,
		'--app-border': theme.other.appBorderLight,
	},
	dark: {
		'--mantine-color-body': theme.other.appBgDark,
		'--mantine-color-text': theme.other.appTextDark,
		'--app-surface': theme.other.appSurfaceDark,
		'--app-surface-muted': theme.other.appSurfaceMutedDark,
		'--app-text': theme.other.appTextDark,
		'--app-text-muted': theme.other.appTextMutedDark,
		'--app-border': theme.other.appBorderDark,
	},
});
