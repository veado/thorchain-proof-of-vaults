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

	import { dataRD, loadAllData, vaults, pools } from './stores/store';
	import * as RD from '@devexperts/remote-data-ts';
	import { onMount } from 'svelte';
	import { getNoVaults, getPoolStatus, trimAddress } from './utils/data';
	import { sequenceSOption } from './utils/fp';
	import ExternalLinkIcon from './components/IconExternalLink.svelte';
	import type { PoolStatus, VaultStatus, VaultType } from './types/types';
	import AssetIcon from './components/AssetIcon.svelte';

	const getColorByPoolStatus = (status: PoolStatus) => {
		switch (status) {
			case 'available':
				return 'bg-cyan-500';
			case 'staged':
				return 'bg-stone-300';
			case 'suspended':
				return 'bg-gray-300';
			case 'unknown':
				return 'bg-gray-300';
		}
	};

	const getColorByVaultStatus = (status: VaultStatus) => {
		switch (status) {
			case 'ActiveVault':
			case 'Active':
				return 'bg-cyan-500';
			case 'RetiringVault':
			case 'Standby':
				return 'bg-stone-300';
			case 'unknown':
				return 'bg-gray-300';
		}
	};

	const getColorByVaultType = (type: VaultType) => {
		switch (type) {
			case 'asgard':
				return 'bg-lime-500';
			case 'ygg':
				return 'bg-yellow-500';
			case 'bond':
				return 'bg-black-300';
			case 'unknown':
				return 'bg-gray-300';
		}
	};

	// load all data on start
	onMount(loadAllData);
</script>

<main class="flex flex-col bg-gray-100 p-10 md:p-20">
	<div class="container bg-white flex flex-col p-10 md:p-20 shadow-md">
		<div class="flex justify-center mb-5">
			<img
				src={logo}
				class="max-w-full rounded-full w-[50px] h-[50px] border-4 border-black"
				alt=""
			/>
		</div>
		<h1 class="text-2xl text-center uppercase">Proof Of Vaults</h1>
		<button class=" text-gray-300" on:click={loadAllData}>Reload data</button>
		<div>
			{FP.pipe(
				$dataRD,
				RD.fold(
					() => '...',
					() => '...',
					(error) => error.toString(),
					({ vaults, pools, nodes }) =>
						`${vaults.length} vaults / ${pools.size} pools / ${nodes.length} active nodes`
				)
			)}
		</div>
		{#each $vaults as vs}
			{@const asset = vs.asset}
			{@const poolStatus = getPoolStatus(asset, $pools)}
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
										() => 'Unknown USD price',
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
					<div class="flex items-start mt-10">
						<div
							class={`${getColorByVaultType(
								'asgard'
							)} rounded-lg text-gray-50 px-3 text-xs xl:text-base uppercase`}
						>
							{noAsgards} Asgards
						</div>
						{#if noYggs > 0}
							<div
								class={`${getColorByVaultType(
									'ygg'
								)} rounded-lg text-gray-50 px-3 text-xs xl:text-base uppercase ml-2`}
							>
								{noYggs} Yggdrasils
							</div>
						{/if}
						<div
							class={`${getColorByPoolStatus(
								poolStatus
							)} rounded-lg text-gray-50 text-xs xl:text-base ml-2 px-3 uppercase`}
						>
							{getPoolStatus(asset, $pools)} pool
						</div>
					</div>
				</div>
				<!-- vault details -->
				<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 xl:gap-6 mt-20">
					{#each vs.data as v}
						{@const addr = O.getOrElse(() => '')(v.address)}
						<div class="flex flex-col items-center py-3 px-5 bg-gray-50 rounded-lg">
							<div class="flex items-center">
								<div
									class={`${getColorByVaultType(
										v.type
									)} rounded-lg text-gray-50 px-3 text-xs uppercase`}
								>
									{v.type}
								</div>
								<div
									class={`${getColorByVaultStatus(
										v.status
									)} rounded-lg text-gray-50 px-3 text-xs ml-2 uppercase`}
								>
									{v.status}
								</div>
							</div>
							{#if !!addr}
								<div class="flex items-center text-base text-indigo-600 ml-2" title={addr}>
									<span class="">{trimAddress(addr)} </span><ExternalLinkIcon class="ml-1" />
								</div>
							{/if}
							<div class="text-lg text-gray-600 leading-none">
								{formatAssetAmountCurrency({
									amount: baseToAsset(v.amount),
									asset: v.asset,
									decimal: 6,
									trimZeros: true
								})}
							</div>
							<div class="text-base text-gray-300 leading-none">
								{FP.pipe(
									sequenceSOption({
										asset: O.fromNullable(assetFromString('BNB.BUSD')),
										amount: v.amountUSD
									}),
									O.map(({ asset, amount }) =>
										formatAssetAmountCurrency({ amount, asset, decimal: 2, trimZeros: false })
									),
									O.getOrElse(() => 'Unknown USD price')
								)}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</main>
