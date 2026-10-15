import babel from '@rolldown/plugin-babel';
import { devtools } from '@tanstack/devtools-vite';

import { tanstackStart } from '@tanstack/react-start/plugin/vite';

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		tanstackStart({
			prerender: {
				enabled: false,
			},
			sitemap: {
				enabled: true,
				host: process.env.VITE_SITE_URL ?? 'http://localhost:3000',
			},
		}),
		nitro({ preset: 'bun' }),
		viteReact(),
		babel({ presets: [reactCompilerPreset()] }),
	],
});

export default config;
