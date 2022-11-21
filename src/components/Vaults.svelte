<script lang="ts">
	import type { VaultListData } from 'src/types/types';

	import * as FP from 'fp-ts/lib/function';

	import * as O from 'fp-ts/lib/Option';

	import { formatAssetAmountCurrency, baseToAsset, assetAmount } from '@xchainjs/xchain-util';

	import { pools$ } from '../stores/store';
	import { getNoVaults, getPoolStatus } from '../utils/data';

	import AssetIcon from './AssetIcon.svelte';
	import LoaderIcon from './LoaderIcon.svelte';
	import { labelByPoolStatus } from '../utils/renderer';
	import Vault from './Vault.svelte';

	export let item: VaultListData;
	export let loading = false;

	const { asset, data, total, totalUSD } = item;

	const noAsgards = getNoVaults('asgard', data);
	const noYggs = getNoVaults('ygg', data);
</script>

<!-- vaults wrapper -->
<div class="mb-20 flex flex-col rounded-xl border border-gray-300 p-10">
	<!-- vault overview -->
	<div class="flex flex-col items-center justify-center">
		<div class="flex items-center">
			<AssetIcon
				{asset}
				class="h-[50px] w-[50px] lg:h-[60px] lg:w-[60px] xl:h-[70px] xl:w-[70px]"
			/>
			<div class="ml-1 border-r border-gray-400 pr-10 lg:ml-3 xl:ml-5">
				<h1 class="pb-1 text-xl leading-none text-gray-800 lg:text-3xl xl:text-4xl">
					{asset.ticker}
				</h1>
				<h2 class="lg:text-1xl py-0 text-lg leading-none text-gray-400 xl:text-2xl">
					{asset.chain}
				</h2>
			</div>
			<div class="ml-10 flex flex-col">
				<h3 class="py-0 text-xl leading-none text-gray-600 lg:text-3xl xl:text-4xl">
					{formatAssetAmountCurrency({
						amount: baseToAsset(total),
						asset,
						trimZeros: true,
						decimal: 6
					})}
				</h3>
				<h3 class="lg:text-1xl py-0 pt-1 text-lg leading-none text-gray-300 xl:text-2xl">
					{FP.pipe(
						totalUSD,
						O.chain(O.fromPredicate((totalUSD) => totalUSD.gt(assetAmount(0)))),
						O.fold(
							() => '$ unknown price',
							(totalUSD) =>
								formatAssetAmountCurrency({
									amount: totalUSD,
									decimal: 2,
									trimZeros: false
								})
						)
					)}
				</h3>
			</div>
		</div>
		<div class="my-4 flex justify-center">
			<LoaderIcon class={`text-gray-400 ${loading ? 'visible' : 'invisible'}`} />
		</div>
		<div class="flex items-center">
			<div class={` px-3 text-base uppercase text-gray-500 xl:text-lg`}>
				{noAsgards} Asgards
			</div>
			{#if noYggs > 0}
				<div class={`border-l border-gray-400 px-3 text-base uppercase text-gray-500 xl:text-lg`}>
					{noYggs} Yggdrasils
				</div>
			{/if}
			<div class={`border-l border-gray-400 px-3 text-base  uppercase text-gray-500 xl:text-lg`}>
				{labelByPoolStatus(getPoolStatus(asset, $pools$))} pool
			</div>
		</div>
	</div>
	<!-- vault details -->
	<div class="mt-20 grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3 xl:gap-6">
		{#each data as v (v.asset)}
			<Vault data={v} />
		{/each}
	</div>
</div>