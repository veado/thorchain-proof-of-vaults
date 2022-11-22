<script lang="ts">
	import type { VaultDetailsStatus, VaultListData } from 'src/types/types';

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

	const { asset, data, total, totalUSD } = item;

	const noAsgards = getNoVaults('asgard', data);
	const noYggs = getNoVaults('ygg', data);
</script>

<!-- vaults wrapper -->
<div
	class="mb-5 flex flex-col rounded-lg border border-gray-300 p-5 xl:mb-10 xl:rounded-xl xl:p-10 "
>
	<!-- vault overview -->
	<div class="flex flex-col items-center justify-center">
		<div class="flex flex-col items-center lg:flex-row">
			<!-- asset -->
			<div class="flex items-center pb-3 lg:border-r lg:border-gray-400 lg:pr-10 lg:pb-0 ">
				<AssetIcon
					class="h-[40px] w-[40px] lg:h-[60px] lg:w-[60px] xl:h-[70px] xl:w-[70px]"
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
					class="lg:text-1xl py-0 pt-1 text-center text-lg leading-none text-gray-300 lg:text-start xl:text-2xl"
				>
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
		<!-- loader -->
		<div class="my-2 flex justify-center lg:my-4 {loading ? 'block' : 'hidden'} text-gray-400">
			<LoaderIcon />
		</div>

		<!-- vaults content -->
		<div class="flex items-center py-3 lg:py-5">
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
	<div class="flex justify-center xl:pt-10">
		<button
			class="rounded-full border border-gray-400 bg-white p-4 text-gray-400 hover:border-gray-500 hover:text-gray-500 hover:shadow-lg "
			on:click={toggleDetails}
		>
			<ChevronDoubleDownIcon class="h-4 w-4 lg:h-6 lg:w-6 {showDetails ? 'rotate-180' : ''}" />
		</button>
	</div>
	{#if showDetails}
		<!-- vault details -->
		<div class="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2 xl:mt-10 xl:grid-cols-3 xl:gap-6">
			{#each data as v (v.asset)}
				<Vault data={v} />
			{/each}
		</div>
	{/if}
</div>
