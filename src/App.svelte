<script lang="ts">
	import logo from './assets/logo.png';
	import * as FP from 'fp-ts/lib/function';

	import * as O from 'fp-ts/lib/Option';

	import { formatAssetAmountCurrency, baseToAsset, formatAssetAmount } from '@xchainjs/xchain-util';

	import { dataRD, loadAllData, vaults } from './stores/store';
	import * as RD from '@devexperts/remote-data-ts';
	import { onMount } from 'svelte';
	import { sumAmounts } from './utils/data';

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
						`${vaults.size} ASGARD's / ${pools.length} pools / ${nodes.length} active nodes`
				)
			)}
		</div>
		{#each $vaults as vs}
			<h1>{vs.id}</h1>
			<h3>Vaults {vs.vaults.length}</h3>
			<h3>TOTAL {formatAssetAmount({ amount: baseToAsset(sumAmounts(vs.vaults)) })}</h3>
			{#each vs.vaults as v}
				<div>{v.type}</div>
				<div>{formatAssetAmountCurrency({ amount: baseToAsset(v.amount), asset: v.asset })}</div>
				<div>{O.getOrElse(() => '')(v.address)}</div>
			{/each}
			<div>-----</div>
		{/each}
	</div>
</main>
