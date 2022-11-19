<script lang="ts">
	import logo from './assets/logo.png';
	import * as FP from 'fp-ts/lib/function';

	import * as O from 'fp-ts/lib/Option';

	import {
		formatAssetAmountCurrency,
		baseToAsset,
		assetFromString,
		assetAmount
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
	import ExternalLinkIcon from './components/IconExternalLink.svelte';
	import type { PoolStatus, VaultStatus, VaultType } from './types/types';
	import AssetIcon from './components/AssetIcon.svelte';
	import LoaderIcon from './components/LoaderIcon.svelte';

	const labelPoolStatus = (status: PoolStatus) => {
		switch (status) {
			case 'available':
				return 'active';
			case 'staged':
				return 'pending';
			case 'suspended':
				return 'inactive';
			case 'unknown':
				return 'unknown';
		}
	};

	const labelVaultStatus = (status: VaultStatus) => {
		switch (status) {
			case 'ActiveVault':
			case 'Active':
				return 'active';
			case 'RetiringVault':
				return 'retiring';
			case 'Standby':
				return 'standby';
			case 'unknown':
				return 'unkown';
		}
	};

	const labelVaultType = (type: VaultType) => {
		switch (type) {
			case 'asgard':
				return 'asgard';
			case 'ygg':
				return 'Yggdrasil';
			case 'bond':
				return 'bond';
			case 'unknown':
				return 'unknown';
		}
	};

	$: loading = RD.isPending($dataRD$);

	$: emptyData = $vaults$.length <= 0 || $pools$.size <= 0;

	// load all data on start
	onMount(loadAllData);
</script>

<main class={`flex flex-col bg-gray-100 p-10 md:p-20 ${emptyData ? 'h-screen' : ''}`}>
	<div
		class={`container bg-white flex flex-col p-10 md:p-20 shadow-md ${
			emptyData ? 'min-h-full' : ''
		}`}
	>
		<div class="flex justify-center mb-5">
			<img
				src={logo}
				class="max-w-full rounded-full w-[50px] h-[50px] border-4 border-black"
				alt=""
			/>
		</div>
		<h1 class="text-2xl text-center uppercase">Proof Of Vaults</h1>
		<div class="flex flex-col justify-center items-center my-10">
			<button
				class={`flex items-center w-auto px-6 py-2 text-lg bg-gray-500 text-white rounded-full uppercase shadow-md hover:bg-gray-600 hover:shadow-lg ${
					loading ? 'cursor-not-allowed' : 'cursor-pointer'
				}`}
				on:click={loadAllData}
				disabled={loading}
			>
				<LoaderIcon class={`mr-2 ${!loading ? 'hidden' : ''}`} />
				Reload data
			</button>

			<div class="flex items-center py-2">
				<input
					id="autoreload"
					type="checkbox"
					class="peer h-4 w-4 border-gray-400 checked:border-none checked:text-gray-500 focus:ring-0"
					checked={$autoReload$$}
					disabled={loading}
					on:change={() => autoReload$$.update((v) => !v)}
				/>
				<label
					class={`text-sm ml-2 
          ${
						loading
							? 'text-gray-300 cursor-not-allowed'
							: 'text-gray-400 cursor-pointer hover:text-gray-600 peer-checked:text-gray-500'
					} `}
					for="autoreload"
					>Auto reload ({new Date($timeLeft$ * 1000).toISOString().substring(14, 19)})</label
				>
			</div>
		</div>
		<div class="flex itmes-center py-4">
			<select
				class="form-select appearance-none
          block
          w-[200px]
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-500
          bg-white bg-clip-padding bg-no-repeat
          border border-solid border-gray-400 focus:border-gray-600 focus:ring-0
          focus:outline-none"
				bind:value={$vaultSort$$}
			>
				<option value="usd">USD ↑</option>
				<option value="usdRev">USD ↓</option>
				<option value="name">Asset ↑</option>
				<option value="nameRev">Asset ↓</option>
			</select>
		</div>
		{#each $vaults$ as vs}
			{@const asset = vs.asset}
			{@const poolStatus = getPoolStatus(asset, $pools$)}
			{@const noAsgards = getNoVaults('asgard', vs.data)}
			{@const noYggs = getNoVaults('ygg', vs.data)}
			<!-- vaults wrapper -->
			<div class="flex flex-col p-10 rounded-xl border border-gray-300 mb-20">
				<!-- vault overview -->
				<div class="flex flex-col justify-center items-center">
					<div class="flex items-center">
						<AssetIcon
							{asset}
							class="w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] xl:w-[70px] xl:h-[70px]"
						/>
						<div class="ml-1 lg:ml-3 xl:ml-5 pr-10 border-r border-gray-200">
							<h1 class="text-xl lg:text-3xl xl:text-4xl text-gray-800 leading-none pb-1">
								{asset.ticker}
							</h1>
							<h2 class="text-lg lg:text-1xl xl:text-2xl text-gray-400 py-0 leading-none">
								{asset.chain}
							</h2>
						</div>
						<div class="flex flex-col ml-10">
							<h3 class="text-xl lg:text-3xl xl:text-4xl text-gray-600 py-0 leading-none">
								{formatAssetAmountCurrency({
									amount: baseToAsset(vs.total),
									asset,
									trimZeros: true,
									decimal: 6
								})}
							</h3>
							<h3 class="text-lg lg:text-1xl xl:text-2xl text-gray-300 py-0 leading-none pt-1">
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
					<div class="flex justify-center my-4">
						<LoaderIcon class={`text-gray-400 ${loading ? 'visible' : 'invisible'}`} />
					</div>
					<div class="flex items-center">
						<div class={` text-gray-500 px-3 text-base xl:text-lg uppercase`}>
							{noAsgards} Asgards
						</div>
						{#if noYggs > 0}
							<div
								class={`border-l border-gray-300 text-gray-500 px-3 text-base xl:text-lg uppercase`}
							>
								{noYggs} Yggdrasils
							</div>
						{/if}
						<div
							class={`border-l border-gray-300 text-gray-500 px-3  text-base xl:text-lg uppercase`}
						>
							{labelPoolStatus(getPoolStatus(asset, $pools$))} pool
						</div>
					</div>
				</div>
				<!-- vault details -->
				<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 xl:gap-6 mt-20">
					{#each vs.data as v}
						{@const addr = O.getOrElse(() => '')(v.address)}
						<div class="flex flex-col items-center bg-gray-50 rounded-lg">
							<div
								class={`w-full text-center bg-gray-100 text-gray-500 text-xs uppercase py-3 px-2  rounded-t-lg`}
							>
								{labelVaultType(v.type)}
								<span class="lower-case">({labelVaultStatus(v.status)})</span>
							</div>
							<div class="text-xl text-gray-600 leading-none pt-4">
								{formatAssetAmountCurrency({
									amount: baseToAsset(v.amount),
									asset: v.asset,
									decimal: 6,
									trimZeros: true
								})}
							</div>
							<div class="text-base text-gray-400 leading-none  pt-2">
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
									class="flex justify-center items-center text-base text-gray-600 pt-3 pb-4"
									title={addr}
								>
									<span class="">{trimAddress(addr)} </span><ExternalLinkIcon class="ml-1" />
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</main>
