/// <reference types="svelte" />
// Vite
// IntelliSense for TypeScript
// https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript

/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_MIDGARD_URL: string;
	readonly VITE_THORNODE_URL: string;
	readonly VITE_VERSION: string;
	readonly VITE_COMMIT_HASH: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
