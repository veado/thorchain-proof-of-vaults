<script lang="ts">
	import type { VaultData } from 'src/types/types';
	import * as FP from 'fp-ts/lib/function';
	import * as O from 'fp-ts/lib/Option';
	import { sequenceSOption } from '../utils/fp';
	import { assetFromString, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util';
	import { ExternalLinkIcon } from '@krowten/svelte-heroicons';
	import { labelByVaultStatus, labelByVaultType } from '../utils/renderer';
	import { getExplorerAddressUrl, trimAddress } from '../utils/data';

	export let data: VaultData;
	let className = '';
	export { className as class };

	const { type, asset, status, amount, amountUSD, address: oAddress } = data;
	const addr = FP.pipe(
		oAddress,
		O.getOrElse(() => '')
	);

	const onClickAddress = (address, chain) => {
		const url = getExplorerAddressUrl(chain, address);
		window.open(url);
	};
</script>

<div class="flex flex-col items-center rounded-lg bg-gray-50 {className}">
	<div
		class="w-full rounded-t-lg bg-gray-100 py-3 px-2 text-center text-xs uppercase  text-gray-500"
	>
		{labelByVaultType(type)}
		<span class="lower-case">({labelByVaultStatus(status)})</span>
	</div>
	<div class="pt-4 text-xl leading-none text-gray-600">
		{formatAssetAmountCurrency({
			amount: baseToAsset(amount),
			asset,
			decimal: 6,
			trimZeros: true
		})}
	</div>
	<div class="pt-2 text-base leading-none  text-gray-400">
		{FP.pipe(
			sequenceSOption({
				asset: O.fromNullable(assetFromString('BNB.BUSD')),
				amount: amountUSD
			}),
			O.map(({ asset, amount }) =>
				formatAssetAmountCurrency({ amount, asset, decimal: 2, trimZeros: false })
			),
			O.getOrElse(() => '$ unknown price')
		)}
	</div>
	{#if !!addr}
		<button
			class="flex cursor-pointer items-center justify-center pt-3 pb-4 text-base text-gray-500 hover:text-gray-600"
			alt={addr}
			on:click={() => onClickAddress(addr, asset.chain)}
		>
			{trimAddress(addr)}
			<ExternalLinkIcon class="ml-1 h-4 w-4" />
		</button>
	{/if}
</div>
