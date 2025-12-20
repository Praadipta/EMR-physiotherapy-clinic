import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Using Node adapter for Docker deployment
		adapter: adapter({
			out: 'build',
			precompress: false,
			envPrefix: ''
		}),
		// Disable built-in CSRF - we handle it in hooks.server.ts with multiple origins
		csrf: {
			checkOrigin: false
		}
	}
};

export default config;
