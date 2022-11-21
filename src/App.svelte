<script lang="ts">
	import logo from './assets/logo.png';
	import * as FP from 'fp-ts/lib/function';

	import * as O from 'fp-ts/lib/Option';

	import {
		formatAssetAmountCurrency,
		baseToAsset,
		assetFromString,
		assetAmount,
		assetToString
	} from '@xchainjs/xchain-util';

	import {
		dataRD$,
		loadAllData,
		vaultsSorted$ as vaults$,
		pools$,
		timeLeft$,
		autoReload$$,
		vaultSort$$
	} from './stores/store';
	import * as RD from '@devexperts/remote-data-ts';
	import { onMount } from 'svelte';
	import { getNoVaults, getPoolStatus, trimAddress } from './utils/data';
	import { sequenceSOption } from './utils/fp';
	import AssetIcon from './components/AssetIcon.svelte';
	import LoaderIcon from './components/LoaderIcon.svelte';
	import VaultSortDropdown from './components/VaultSortDropdown.svelte';
	import { labelByPoolStatus, labelByVaultStatus, labelByVaultType } from './utils/renderer';
	import { ExternalLinkIcon } from '@krowten/svelte-heroicons';

	$: loading = RD.isPending($dataRD$);

	$: emptyData = $vaults$.length <= 0 || $pools$.size <= 0;

	// load all data at start
	onMount(loadAllData);
</script>

<main class="flex flex-col bg-gray-100 p-10 md:p-20 {emptyData ? 'h-screen' : ''}">
	<div
		class={`container flex flex-col bg-white p-10 shadow-md md:p-20 ${
			emptyData ? 'min-h-full' : ''
		}`}
	>
		<div class="mb-5 flex justify-center">
			<img
				src={logo}
				class="h-[50px] w-[50px] max-w-full rounded-full border-4 border-black"
				alt=""
			/>
		</div>
		<h1 class="text-center text-2xl uppercase">Proof Of Vaults</h1>
		<div class="my-10 flex flex-col items-center justify-center">
			<button
				class="flex w-auto items-center rounded-full bg-gray-500 px-6 py-2 text-lg uppercase text-white
         hover:bg-gray-600 hover:shadow-lg {loading ? 'cursor-not-allowed' : 'cursor-pointer'}"
				on:click={loadAllData}
				disabled={loading}
			>
				<LoaderIcon class={`mr-2 ${!loading ? 'hidden' : ''}`} />
				Reload data
			</button>

			<div class="form-check items-center py-2">
				<input
					id="autoreload"
					type="checkbox"
					class="peer
          form-check-input 
          float-left mt-1 mr-1 
          h-4 w-4 
          cursor-pointer 
          appearance-none 
          rounded-sm border border-gray-400 bg-white bg-contain bg-center bg-no-repeat 
          align-top checked:border-none checked:bg-gray-500 focus:outline-none"
					checked={$autoReload$$}
					disabled={loading}
					on:change={() => autoReload$$.update((v) => !v)}
				/>
				<label
					class="ml-2 text-sm 
        {loading
						? 'cursor-not-allowed text-gray-300'
						: 'cursor-pointer text-gray-400 hover:text-gray-500'}
            peer-checked:text-gray-500
            "
					for="autoreload"
					>Auto reload {$autoReload$$
						? `(${new Date($timeLeft$ * 1000).toISOString().substring(14, 19)})`
						: ''}
				</label>
			</div>
		</div>

		<VaultSortDropdown
			class="w-[200px] py-4"
			current={$vaultSort$$}
			on:item-selected={({ detail }) => vaultSort$$.set(detail)}
		/>
		{#each $vaults$ as vs (assetToString(vs.asset))}
			{@const asset = vs.asset}
			{@const noAsgards = getNoVaults('asgard', vs.data)}
			{@const noYggs = getNoVaults('ygg', vs.data)}
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
									amount: baseToAsset(vs.total),
									asset,
									trimZeros: true,
									decimal: 6
								})}
							</h3>
							<h3 class="lg:text-1xl py-0 pt-1 text-lg leading-none text-gray-300 xl:text-2xl">
								{FP.pipe(
									vs.totalUSD,
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
							<div
								class={`border-l border-gray-400 px-3 text-base uppercase text-gray-500 xl:text-lg`}
							>
								{noYggs} Yggdrasils
							</div>
						{/if}
						<div
							class={`border-l border-gray-400 px-3 text-base  uppercase text-gray-500 xl:text-lg`}
						>
							{labelByPoolStatus(getPoolStatus(asset, $pools$))} pool
						</div>
					</div>
				</div>
				<!-- vault details -->
				<div class="mt-20 grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3 xl:gap-6">
					{#each vs.data as v (v.asset)}
						{@const addr = O.getOrElse(() => '')(v.address)}
						<div class="flex flex-col items-center rounded-lg bg-gray-50">
							<div
								class={`w-full rounded-t-lg bg-gray-100 py-3 px-2 text-center text-xs uppercase  text-gray-500`}
							>
								{labelByVaultType(v.type)}
								<span class="lower-case">({labelByVaultStatus(v.status)})</span>
							</div>
							<div class="pt-4 text-xl leading-none text-gray-600">
								{formatAssetAmountCurrency({
									amount: baseToAsset(v.amount),
									asset: v.asset,
									decimal: 6,
									trimZeros: true
								})}
							</div>
							<div class="pt-2 text-base leading-none  text-gray-400">
								{FP.pipe(
									sequenceSOption({
										asset: O.fromNullable(assetFromString('BNB.BUSD')),
										amount: v.amountUSD
									}),
									O.map(({ asset, amount }) =>
										formatAssetAmountCurrency({ amount, asset, decimal: 2, trimZeros: false })
									),
									O.getOrElse(() => '$ unknown price')
								)}
							</div>
							{#if !!addr}
								<div
									class="flex items-center justify-center pt-3 pb-4 text-base text-gray-600 "
									title={addr}
								>
									<span class="">{trimAddress(addr)} </span><ExternalLinkIcon
										class="ml-1  h-4 w-4"
									/>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</main>
