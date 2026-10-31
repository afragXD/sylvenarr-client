import { type CSSVariablesResolver, createTheme, type MantineColorsTuple } from '@mantine/core';

/** Brass — brand / primary (латунь BG3) */
const brand: MantineColorsTuple = [
	'#f5f0e4',
	'#ebe2ce',
	'#ddcfb0',
	'#cbb48c',
	'#c4a878',
	'#b8954a',
	'#CBB48C',
	'#a88948',
	'#8a6f3a',
	'#5c4a28',
];

/** Wine — accent (поражение / меню) */
const accent: MantineColorsTuple = [
	'#f5e8e8',
	'#e8cfcf',
	'#d4a0a3',
	'#b86a6e',
	'#8e3a3e',
	'#6e2024',
	'#4E1418',
	'#3e1014',
	'#2e0c10',
	'#1e080a',
];

/** Moss — победа / высокий винрейт */
const moss: MantineColorsTuple = [
	'#f0f4ec',
	'#dde6d4',
	'#c0d1b0',
	'#9fb88a',
	'#84a36c',
	'#6f9158',
	'#5E7F4A',
	'#4d683c',
	'#3f5432',
	'#324028',
];

export const theme = createTheme({
	primaryColor: 'brand',
	primaryShade: { light: 6, dark: 6 },
	colors: {
		brand,
		accent,
		moss,
	},
	fontFamily: '"Alegreya Sans", system-ui, sans-serif',
	fontFamilyMonospace: '"Alegreya Sans", system-ui, sans-serif',
	headings: {
		fontFamily: '"Alegreya SC", "Times New Roman", serif',
		fontWeight: '700',
		sizes: {
			h1: { fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: '1.15' },
			h2: { fontSize: 'clamp(1.65rem, 3vw, 2.25rem)', lineHeight: '1.2' },
			h3: { fontSize: 'clamp(1.25rem, 2vw, 1.5rem)', lineHeight: '1.25' },
			h4: { fontSize: '1.15rem', lineHeight: '1.3' },
		},
	},
	defaultRadius: 0,
	other: {
		appBg: '#000000',
		appSurface: '#1A130E',
		appSurfaceMuted: '#2A1F17',
		appText: '#F2ECE2',
		appTextMuted: 'rgba(242, 236, 226, 0.65)',
		appBorder: '#4A3F2E',
		brass: '#CBB48C',
		copper: '#E9C08F',
		/** Враг / опасность (стайлгайд); поражение на итоге */
		enemy: '#D9574A',
		parchment: '#EFE2CC',
		parchmentInk: '#2B2219',
		wine: '#4E1418',
		smoke: '#2A1F17',
		smokeDeep: '#1A130E',
		/** Фон оверлея итога матча */
		matchResultBg: '#17110C',
	},
	components: {
		Button: {
			defaultProps: {
				radius: 0,
			},
			styles: {
				root: {
					fontFamily: '"Alegreya SC", "Times New Roman", serif',
					fontWeight: 700,
					letterSpacing: '0.04em',
					textTransform: 'uppercase',
				},
			},
		},
		TextInput: {
			defaultProps: {
				radius: 0,
			},
		},
		ActionIcon: {
			defaultProps: {
				radius: 0,
			},
		},
	},
});

export const cssVariablesResolver: CSSVariablesResolver = (theme) => ({
	variables: {
		'--brass': theme.other.brass,
		'--copper': theme.other.copper,
		'--enemy': theme.other.enemy,
		'--match-result-bg': theme.other.matchResultBg,
		'--parchment': theme.other.parchment,
		'--parchment-ink': theme.other.parchmentInk,
		'--wine': theme.other.wine,
		'--smoke': theme.other.smoke,
		'--smoke-deep': theme.other.smokeDeep,
		/* Общий горизонтальный край хедера, страниц и подвала. */
		'--page-inline': 'clamp(1rem, 3.5vw, 3rem)',
		'--page-max': '88rem',
	},
	light: {
		'--mantine-color-body': theme.other.appBg,
		'--mantine-color-text': theme.other.appText,
		'--app-surface': theme.other.appSurface,
		'--app-surface-muted': theme.other.appSurfaceMuted,
		'--app-text': theme.other.appText,
		'--app-text-muted': theme.other.appTextMuted,
		'--app-border': theme.other.appBorder,
	},
	dark: {
		'--mantine-color-body': theme.other.appBg,
		'--mantine-color-text': theme.other.appText,
		'--app-surface': theme.other.appSurface,
		'--app-surface-muted': theme.other.appSurfaceMuted,
		'--app-text': theme.other.appText,
		'--app-text-muted': theme.other.appTextMuted,
		'--app-border': theme.other.appBorder,
	},
});
