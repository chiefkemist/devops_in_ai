
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import path from 'path'

export default defineConfig({
	plugins: [react()],
	css: {
		postcss: {
			plugins: [tailwindcss, autoprefixer],
		},
	},
	build: {
		outDir: 'client/public',
		assetsDir: 'assets',
		rollupOptions: {
			input: 'assets/javascript/main.jsx',
			output: {
				entryFileNames: 'js/[name].js',
				chunkFileNames: 'js/[name].js',
				assetFileNames: (assetInfo) => {
					if (assetInfo.name.endsWith('.css')) {
						return 'stylesheets/[name][extname]';
					}
					return 'assets/[name][extname]';
				},
			},
		},
		emitManifest: true,
	},
})

