<script lang="ts">
	import IconBTC from '../assets/asset-btc.svg';
	import IconETH from '../assets/asset-eth.svg';
	import IconRUNE from '../assets/asset-rune.svg';
	import IconBNB from '../assets/asset-bnb.svg';
	import IconBnbRune from '../assets/asset-bnb-rune.svg';
	import IconXRune from '../assets/asset-xrune.svg';
	import IconTGT from '../assets/asset-tgt.png';
	import IconDOGE from '../assets/asset-doge.png';
	import IconATOM from '../assets/asset-atom.svg';

	import {
		AssetAtom,
		AssetAVAX,
		AssetBCH,
		AssetBNB,
		AssetBTC,
		AssetDOGE,
		AssetETH,
		AssetLTC,
		AssetRuneB1A,
		AssetRuneNative,
		AVAXChain,
		BNBChain,
		eqAsset,
		eqChain,
		ETHChain,
		type Asset
	} from '@xchainjs/xchain-util';
	import { AssetTGTERC20, AssetXRune } from '../stores/const';

	import * as FP from 'fp-ts/lib/function';
	import { getEthTokenAddress } from '../utils/data';
	import LoaderIcon from './LoaderIcon.svelte';
	import UnkownAssetIcon from './UnkownAssetIcon.svelte';

	let className = '';
	export { className as class };
	export let asset: Asset;

	let hasError = false;

	$: imgSrc = (asset: Asset) => {
		hasError = false;
		// BTC
		if (eqAsset(asset, AssetBTC)) {
			return IconBTC;
		}
		// ETH
		if (eqAsset(asset, AssetETH)) {
			return IconETH;
		}
		// RUNE
		if (eqAsset(asset, AssetRuneNative)) {
			return IconRUNE;
		}
		// BNB RUNE
		if (eqAsset(asset, AssetRuneB1A)) {
			return IconBnbRune;
		}
		// BNB
		if (eqAsset(asset, AssetBNB)) {
			return IconBNB;
		}
		// LTC
		if (eqAsset(asset, AssetLTC)) {
			return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/litecoin/info/logo.png`;
		}
		// BCH
		if (eqAsset(asset, AssetBCH)) {
			return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoincash/info/logo.png`;
		}
		// XRune
		if (eqAsset(asset, AssetXRune)) {
			return IconXRune;
		}

		// TGT
		if (eqAsset(asset, AssetTGTERC20)) {
			return IconTGT;
		}

		// DOGE
		if (eqAsset(asset, AssetDOGE)) {
			return IconDOGE;
		}

		// Atom
		if (eqAsset(asset, AssetAtom)) {
			return IconATOM;
		}

		// AVAX
		if (eqAsset(asset, AssetAVAX)) {
			return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchex/info/logo.png';
		}

		if (eqChain(asset.chain, BNBChain)) {
			return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/${asset.symbol}/logo.png`;
		}

		// Since we've already checked ETH.ETH before,
		// we know any other asset is ERC20 here
		if (eqChain(asset.chain, ETHChain)) {
			return FP.pipe(
				getEthTokenAddress(asset),
				(addr) =>
					`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${addr}/logo.png`
			);
		}

		if (eqChain(asset.chain, AVAXChain)) {
			return FP.pipe(
				getEthTokenAddress(asset),
				(addr) =>
					`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/assets/${addr}/logo.png`
			);
		}

		hasError = true;
		return null;
	};

	const onImgError = (_: Event) => {
		hasError = true;
	};

	let loaded = false;

	const onImgLoaded = () => {
		loaded = true;
	};
</script>

<div class="relative flex h-full w-full items-center justify-center {className}">
	<LoaderIcon
		class="text-gray-400 dark:text-gray-200 {loaded || hasError ? 'hidden' : ''} h-10 w-10"
	/>

	{#if hasError}
		<UnkownAssetIcon class="absolute h-full w-full rounded-full text-gray-300 dark:text-gray-600" />
	{:else}
		<img
			class="absolute h-full w-full rounded-full"
			src={imgSrc(asset)}
			alt=""
			on:error={onImgError}
			on:load={onImgLoaded}
		/>
	{/if}
</div>
