<script lang="ts">
	import type { VaultDetailsStatus, VaultListData } from 'src/types/types';
	import { fade } from 'svelte/transition';

	import * as FP from 'fp-ts/lib/function';

	import * as O from 'fp-ts/lib/Option';

	import { formatAssetAmountCurrency, baseToAsset, assetAmount } from '@xchainjs/xchain-util';

	import { pools$ } from '../stores/store';
	import { getNoVaults, getPoolStatus } from '../utils/data';

	import AssetIcon from './AssetIcon.svelte';
	import LoaderIcon from './LoaderIcon.svelte';
	import { labelByPoolStatus } from '../utils/renderer';
	import Vault from './Vault.svelte';
	import { createEventDispatcher } from 'svelte';
	import { ChevronDoubleDownIcon } from '@krowten/svelte-heroicons';
	import { THORNODE_DECIMAL } from '../stores/const';

	export let item: VaultListData = undefined;
	export let loading = false;
	export let collapseStatus: VaultDetailsStatus = O.none;

	let showDetails = false;
	const dispatch = createEventDispatcher();

	$: updateShowDetails(collapseStatus);

	const updateShowDetails = (collapseStatus: VaultDetailsStatus) => {
		FP.pipe(
			collapseStatus,
			O.map((status) => {
				if (status === 'expanded') showDetails = true;
				if (status === 'collapsed') showDetails = false;

				return true;
			})
		);
	};

	const toggleDetails = () => {
		showDetails = !showDetails;
		dispatch('details-visible', showDetails);
	};

	const { asset, data, total, totalUSD, assetPriceUSD } = item;

	const noAsgards = getNoVaults('asgard', data);
	const noYggs = getNoVaults('ygg', data);
</script>

<!-- vaults wrapper -->
<div
	class="mb-5 flex flex-col rounded-lg border border-gray-300 p-5 lg:p-10 xl:mb-10 xl:rounded-xl "
>
	<!-- vault overview -->
	<div class="flex flex-col items-center justify-center">
		<div class="flex flex-col items-center lg:flex-row">
			<!-- asset -->
			<div class="flex items-center pb-3 lg:border-r lg:border-gray-400 lg:pr-10 lg:pb-0 ">
				<AssetIcon
					class="h-[45px] w-[45px] lg:h-[60px] lg:w-[60px] xl:h-[70px] xl:w-[70px]"
					{asset}
				/>
				<div class="ml-2 lg:ml-3 xl:ml-5">
					<h1 class="pb-1 text-xl leading-none text-gray-800 lg:text-3xl xl:text-4xl">
						{asset.ticker}
					</h1>
					<h2 class="lg:text-1xl py-0 text-lg leading-none text-gray-400 xl:text-2xl">
						{asset.chain}
					</h2>
				</div>
			</div>

			<!-- amount -->
			<div class="ml-0 mt-3 flex flex-col lg:mt-0 lg:ml-10">
				<h3
					class="py-0 text-center text-xl leading-none text-gray-600 lg:text-start lg:text-3xl xl:text-4xl"
				>
					{formatAssetAmountCurrency({
						amount: baseToAsset(total),
						asset,
						trimZeros: true,
						decimal: 6
					})}
				</h3>
				<h3
					class="lg:text-1xl py-0 pt-1 text-center text-lg leading-none text-gray-400 lg:text-start xl:text-2xl"
				>
					{FP.pipe(
						totalUSD,
						O.chain(O.fromPredicate((totalUSD) => totalUSD.gt(assetAmount(0)))),
						O.fold(
							() => '$ unknown price',
							(totalUSD) =>
								formatAssetAmountCurrency({
									amount: totalUSD,
									decimal: 6,
									trimZeros: true
								})
						)
					)}
					<span class="block text-sm text-gray-300 lg:inline-block">
						{FP.pipe(
							assetPriceUSD,
							O.fold(
								() => '',
								(price) =>
									`(${formatAssetAmountCurrency({
										amount: assetAmount(price, THORNODE_DECIMAL),
										decimal: 8,
										trimZeros: true
									})} / ${asset.ticker})`
							)
						)}
					</span>
				</h3>
			</div>
		</div>
		<!-- loader -->
		<div class="my-1 flex justify-center lg:my-3 {loading ? 'visible' : 'invisible'} text-gray-400">
			<LoaderIcon />
		</div>

		<!-- vaults content -->
		<div class="flex items-center">
			<div class="px-2 text-sm uppercase text-gray-500 lg:px-3 lg:text-base xl:text-lg">
				{noAsgards} Asgards
			</div>
			{#if noYggs > 0}
				<div
					class="border-l border-gray-400 px-3 text-sm uppercase text-gray-500 lg:text-base xl:text-lg"
				>
					{noYggs} Yggdrasils
				</div>
			{/if}
			<div
				class="border-l border-gray-400 px-3 text-sm uppercase  text-gray-500 lg:text-base xl:text-lg"
			>
				{labelByPoolStatus(getPoolStatus(asset, $pools$))} pool
			</div>
		</div>
	</div>
	<!-- toggle button -->
	<div class="mt-5 flex justify-center xl:mt-10">
		<button
			class="ease rounded-full border-2 border-gray-400 bg-white p-2 text-gray-400 hover:scale-105 hover:border-tc hover:text-tc hover:shadow-lg lg:p-4 "
			on:click={toggleDetails}
		>
			<ChevronDoubleDownIcon class="h-4 w-4 lg:h-6 lg:w-6 {showDetails ? 'rotate-180' : ''}" />
		</button>
	</div>
	{#if showDetails}
		<!-- vault details -->
		<div
			transition:fade={{ duration: 250 }}
			class="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2 xl:mt-10 xl:grid-cols-3 xl:gap-6"
		>
			{#each data as v (v.asset)}
				<Vault data={v} />
			{/each}
		</div>
	{/if}
</div>
