import adapter from '@sveltejs/adapter-static';
import { mdsvex } from "mdsvex"

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: mdsvex({
		extensions: [".md"],
	}),
	extensions: [".svelte", ".md"],
	kit: {
		adapter: adapter(),
		alias: {
			"$constants": "src/constants",
			"$functions": "src/functions/*",
			"$components": "src/components/*",
		}
	},
};

export default config;
