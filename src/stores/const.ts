import { ETHChain, type Asset } from '@xchainjs/xchain-util';

export const THORNODE_DECIMAL = 8;
export const THORNODE_URL = import.meta.env?.VITE_THORNODE_URL ?? 'https://thornode.ninerealms.com';
export const MIDGARD_URL = import.meta.env?.VITE_MIDGARD_URL ?? 'https://midgard.ninerealms.com';

export const AssetXRune: Asset = {
	chain: ETHChain,
	symbol: `XRUNE-0x69fa0fee221ad11012bab0fdb45d444d3d2ce71c`,
	ticker: 'XRUNE',
	synth: false
};

export const AssetTGTERC20: Asset = {
	chain: ETHChain,
	symbol: 'TGT-0x108a850856db3f85d0269a2693d896b394c80325',
	ticker: 'TGT',
	synth: false
};
