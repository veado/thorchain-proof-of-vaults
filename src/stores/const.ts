import type { Asset } from '@xchainjs/xchain-util';

export const APP_IDENTIFIER = import.meta.env?.VITE_APP_IDENTIFIER ?? '';

export const THORNODE_DECIMAL = 8;
export const THORNODE_URL = import.meta.env?.VITE_THORNODE_URL ?? 'https://thornode.ninerealms.com';
export const MIDGARD_URL = import.meta.env?.VITE_MIDGARD_URL ?? 'https://midgard.ninerealms.com';

export const GAIAChain = 'GAIA';
export const AssetATOM: Asset = { chain: GAIAChain, symbol: 'ATOM', ticker: 'ATOM', synth: false };
export const AVAXChain = 'AVAX';
export const AssetAVAX: Asset = { chain: AVAXChain, symbol: 'AVAX', ticker: 'AVAX', synth: false };
export const AssetBCH: Asset = { chain: 'BCH', symbol: 'BCH', ticker: 'BCH', synth: false };
export const BCHChain = 'BCH';
export const BNBChain = 'BNB';
export const AssetBNB: Asset = { chain: BNBChain, symbol: 'BNB', ticker: 'BNB', synth: false };
export const AssetRuneB1A: Asset = {
	chain: BNBChain,
	symbol: 'RUNE-B1A',
	ticker: 'RUNE',
	synth: false
};
export const BTCChain = 'BTC';
export const AssetBTC: Asset = { chain: BTCChain, symbol: 'BTC', ticker: 'BTC', synth: false };
export const ETHChain = 'ETH';
export const AssetETH: Asset = { chain: ETHChain, symbol: 'ETH', ticker: 'ETH', synth: false };
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
export const DOGEChain = 'DOGE';
export const AssetDOGE: Asset = { chain: DOGEChain, symbol: 'DOGE', ticker: 'DOGE', synth: false };
export const LTCChain = 'LTC';
export const AssetLTC: Asset = { chain: LTCChain, symbol: 'LTC', ticker: 'LTC', synth: false };
export const THORChain = 'THOR';

export const AssetRuneNative: Asset = {
	chain: THORChain,
	symbol: 'RUNE',
	ticker: 'RUNE',
	synth: false
};

export const MAX_REALOAD_COUNTER = 5 * 60; // 5min
