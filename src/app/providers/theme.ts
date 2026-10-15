import { type CSSVariablesResolver, createTheme, type MantineColorsTuple } from '@mantine/core';

/** Brass — brand / primary (CRPG metal) */
const brand: MantineColorsTuple = [
	'#f7f1e4',
	'#ebe0c4',
	'#dccfa0',
	'#cdb87a',
	'#c4a866',
	'#c4a35a',
	'#C4A35A',
	'#a88948',
	'#8a6f3a',
	'#6b552c',
];

/** Ember — accent (рана / победа) */
const accent: MantineColorsTuple = [
	'#faf0ee',
	'#f0d6d1',
	'#e3ada4',
	'#d58274',
	'#c96555',
	'#c45c48',
	'#C45C48',
	'#a84c3c',
	'#8c3f32',
	'#6b2f26',
];

export const theme = createTheme({
	primaryColor: 'brand',
	primaryShade: { light: 7, dark: 5 },
	colors: {
		brand,
		accent,
	},
	fontFamily: '"Source Sans 3", system-ui, sans-serif',
	fontFamilyMonospace: '"JetBrains Mono", ui-monospace, monospace',
	headings: {
		fontFamily: 'Cinzel, "Times New Roman", serif',
		fontWeight: '600',
	},
	defaultRadius: 0,
	other: {
		appBgLight: '#E7DFD0',
		appBgDark: '#0B0A09',
		appSurfaceLight: '#F4EFE6',
		appSurfaceDark: '#1A1714',
		appSurfaceMutedLight: '#D9D0C0',
		appSurfaceMutedDark: '#252018',
		appTextLight: '#1A1510',
		appTextDark: '#E8E0D0',
		appTextMutedLight: '#5C5348',
		appTextMutedDark: '#A89B88',
		appBorderLight: '#B8A88E',
		appBorderDark: '#4A3F2E',
	},
	components: {
		Button: {
			defaultProps: {
				radius: 0,
			},
			styles: {
				root: {
					fontWeight: 600,
					letterSpacing: '0.02em',
				},
			},
		},
		TextInput: {
			defaultProps: {
				radius: 0,
			},
		},
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
