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
		// CSRF configuration - requires ORIGIN env var to be set correctly in production
		csrf: {
			checkOrigin: true
		}
	}
};

export default config;
