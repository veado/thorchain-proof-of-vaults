import { defineConfig } from 'vite';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { execSync } from 'child_process';

// read package.json
const { version } = JSON.parse(await readFile(resolve('./package.json'), 'utf-8'));

// Add commit hash to Vite's `env`
process.env.VITE_COMMIT_HASH = execSync('git rev-parse --short HEAD').toString();

// Add version no. hash to Vite's `env`
process.env.VITE_VERSION = version;

// https://vitejs.dev/config/
export default defineConfig({
	// https://vitejs.dev/config/#base
	base: '/thorchain-proof-of-vaults/',
	plugins: [svelte()]
});
