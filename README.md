# THORChain Proof Of Vaults

**LIVE** :eyes: https://veado.github.io/thorchain-proof-of-vaults

https://user-images.githubusercontent.com/61792675/204032338-f6a515c6-df14-4887-b7af-d3ddd2d6dfa6.mp4

### Where does the data come from?

- Midgard
- THORNode

## ENV

Copy [env.sample](env.sample) and rename to `.env`. Change environment variables to your needs.

```
# THORNode endpoint
VITE_THORNODE_URL=https://thornode.ninerealms.com
# Midgard endpoint
VITE_MIDGARD_URL=https://midgard.ninerealms.com
# App identifier - needed for requests to ninerealms.com only - keep it empty if you are using other endpoints
VITE_APP_IDENTIFIER=
```

### Local development

```bash
# install dependencies (only once needed)
npm i
# run app locally at http://localhost:3000/thorchain-proof-of-vaults/
npm run dev
```

## Built with (in alphabetical order)

- [heroicons](https://heroicons.com/) / [svelte-heroicons](https://github.com/krowten/svelte-heroicons)
- [fp-ts](https://gcanti.github.io/fp-ts/)
- [Svelte](https://svelte.dev)
- [tailwindcss](https://tailwindcss.com)
- [Tailwind Elements](https://github.com/mdbootstrap/Tailwind-Elements/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [xchain-util](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-util)

## Licence

[MIT](./LICENSE)
