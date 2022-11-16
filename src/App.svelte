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
	import { getPoolStatus, getPrice, sumAmounts, sumUSDAmounts, trimAddress } from './utils/data';
	import { sequenceSOption } from './utils/fp';
	import ExternalLinkIcon from './components/ExternalLinkIcon.svelte';
	import type { PoolStatus, VaultStatus, VaultType } from './types/types';

	const getColorByPoolStatus = (status: PoolStatus) => {
		switch (status) {
			case 'available':
				return 'bg-green-500';
			case 'staged':
				return 'bg-amber-300';
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
				return 'bg-green-500';
			case 'RetiringVault':
			case 'Standby':
				return 'bg-amber-300';
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
						`${vaults.size} ASGARD's / ${pools.size} pools / ${nodes.length} active nodes`
				)
			)}
		</div>
		{#each $vaults as vs}
			{@const asset = assetFromString(vs.id)}
			{@const total = sumAmounts(vs.vaults)}
			{@const totalUSD = sumUSDAmounts(vs.vaults)}
			<!-- vaults wrapper -->
			<div class="flex flex-row p-10 rounded-xl border border-blue-300 mb-20">
				<!-- vault overview -->
				<div class="flex flex-col w-[400px] justify-start items-start">
					{#if asset}
						<h1 class="text-4xl text-gray-800 leading-none pb-1">{asset.ticker}</h1>
						<h2 class="text-2xl text-gray-400 py-0 leading-none">{asset.chain}</h2>
					{:else}
						<h1 class="text-4xl text-gray-400">Unknown asset</h1>
					{/if}
					<div class="flex items-center my-2">
						<div class="bg-blue-300 border rounded-lg text-gray-50 px-1 text-xs uppercase">
							{vs.vaults.length}
							{vs.id === 'THOR.RUNE' ? 'nodes' : 'vaults'}
						</div>
						{#if asset}
							{@const poolStatus = getPoolStatus(asset, $pools)}
							{#if vs.id !== 'THOR.RUNE'}
								<div
									class={`${getColorByPoolStatus(
										poolStatus
									)} border rounded-lg text-gray-50 text-xs ml-1 px-2 uppercase`}
								>
									{poolStatus} pool
								</div>
							{/if}
						{/if}
					</div>
					<h3 class="text-3xl text-gray-600 py-0 leading-none">
						{formatAssetAmountCurrency({
							amount: baseToAsset(total),
							asset,
							trimZeros: true,
							decimal: 6
						})}
					</h3>
					<h3 class="text-xl text-gray-300 py-0 leading-none pt-1">
						{#if totalUSD && totalUSD.gt(assetAmount(0))}
							{formatAssetAmountCurrency({
								amount: totalUSD,
								decimal: 2,
								trimZeros: false
							})}
						{:else}
							Unknown USD price
						{/if}
					</h3>
				</div>
				<div class="flex items-center px-10 ">=></div>
				<!-- vault details -->
				<div>
					{#each vs.vaults as v}
						{@const addr = O.getOrElse(() => '')(v.address)}
						<div class="flex flex-col border-b last:border-b-0 border-gray-200 py-3 px-5">
							<div class="flex items-center">
								<div class="bg-slate-300 border rounded-lg text-gray-50 px-1 text-xs">
									{v.type}
								</div>
								<div
									class={`${getColorByVaultStatus(
										v.status
									)} border rounded-lg text-gray-50 px-1 text-xs ml-2`}
								>
									{v.status}
								</div>
								{#if !!addr}
									<div class="flex items-center text-sm text-blue-400 ml-2" title={addr}>
										<span class="">{trimAddress(addr)}</span><ExternalLinkIcon class="ml-1" />
									</div>
								{/if}
							</div>
							<div class="text-lg text-gray-600 leading-none">
								{formatAssetAmountCurrency({
									amount: baseToAsset(v.amount),
									asset: v.asset,
									decimal: 6,
									trimZeros: true
								})}
							</div>
							<div class="text-sm text-gray-300 leading-none">
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
