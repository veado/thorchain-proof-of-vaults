<script lang="ts">
	import logo from './assets/logo.png';
	import * as FP from 'fp-ts/lib/function';

	import { data, loadAllData } from './stores/store';
	import * as RD from '@devexperts/remote-data-ts';
	import { onMount } from 'svelte';

	// load all data on start
	onMount(loadAllData);
</script>

<main class="flex flex-col bg-gray-100 h-screen p-10 md:p-20">
	<div class="container bg-white flex flex-col p-10 md:p-20 shadow-md h-full">
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
				$data,
				RD.fold(
					() => '...',
					() => '...',
					(error) => error.toString(),
					({ vaults, pools, nodes }) =>
						`${vaults.length} ASGARD's / ${pools.length} pools / ${nodes.length} active nodes`
				)
			)}
		</div>
	</div>
</main>
