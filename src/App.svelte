<script lang="ts">
	import logo from './assets/logo.png';

	import { assetToString } from '@xchainjs/xchain-util';

	import {
		dataRD$,
		loadAllData,
		vaultsSorted$ as vaults$,
		pools$,
		timeLeft$,
		autoReload$$,
		vaultSort$$,
		vaultSearch$$
	} from './stores/store';
	import * as RD from '@devexperts/remote-data-ts';
	import { onMount } from 'svelte';
	import LoaderIcon from './components/LoaderIcon.svelte';
	import VaultSortDropdown from './components/VaultSortDropdown.svelte';
	import Vaults from './components/Vaults.svelte';
	import type { VaultDetailsStatus } from './types/types';
	import * as O from 'fp-ts/lib/Option';
	import { eqOptionString } from './utils/fp';
	import SearchInput from './components/SearchInput.svelte';

	$: loading = RD.isPending($dataRD$);

	$: emptyData = $vaults$.length <= 0 || $pools$.size <= 0;

	const onSearchHandler = ({ detail: search }: CustomEvent<string>) => {
		console.log('onSearch search:', search);
		vaultSearch$$.set(search);
	};

	const onCancelSearchHandler = () => {
		console.log('onCancel');
		vaultSearch$$.set('');
	};

	let vaultDetailsStatus: VaultDetailsStatus = O.some('collapsed');

	const updateToggleStatus = () => {
		/* for any user interaction just set to O.none */
		vaultDetailsStatus = O.none;
	};

	const expandDetails = () => {
		vaultDetailsStatus = O.some('expanded');
	};

	const collapseDetails = () => {
		vaultDetailsStatus = O.some('collapsed');
	};

	$: vaultDetailsCollapsed = eqOptionString.equals(vaultDetailsStatus, O.some('collapsed'));
	$: vaultDetailsExpanded = eqOptionString.equals(vaultDetailsStatus, O.some('expanded'));

	// load all data at start
	onMount(loadAllData);
</script>

<main class="flex flex-col p-10 md:p-20">
	<div class="container flex min-w-[480px] flex-col bg-white p-10 shadow-md lg:p-20">
		<!-- logo + title -->
		<div class="mb-5 flex justify-center">
			<img
				src={logo}
				class="h-[50px] w-[50px] max-w-full rounded-full border-4 border-black"
				alt=""
			/>
		</div>
		<h1 class="text-center text-2xl uppercase">Proof Of Vaults</h1>

		<!-- reload -->
		<div class="my-10 flex flex-col items-center justify-center">
			<button
				class="text-md flex w-auto items-center rounded-full bg-gray-500 px-6 py-2 uppercase text-white
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

		<div
			class="flex flex-col items-center py-1 lg:flex-row lg:items-end lg:justify-between lg:py-4"
		>
			<!-- sort / search -->
			<div class="flex w-full flex-col items-center lg:w-auto lg:flex-row lg:items-center">
				<VaultSortDropdown
					class="w-[80%] lg:w-[100px] xl:w-[200px]"
					current={$vaultSort$$}
					on:item-selected={({ detail }) => vaultSort$$.set(detail)}
				/>

				<SearchInput
					class="mt-5 w-[80%] lg:mt-0 lg:ml-5 lg:w-[300px]"
					placeholder="Search asset"
					on:search={onSearchHandler}
					on:change={onSearchHandler}
					on:cancel={onCancelSearchHandler}
				/>
			</div>
			<!-- collapse -->
			<div class="my-3 flex items-center lg:mt-0">
				<button
					class="ml-2 text-gray-400 underline hover:text-gray-500"
					on:click={expandDetails}
					disabled={vaultDetailsExpanded}
				>
					Expand All
				</button>
				<button
					class="ml-2 text-gray-400 underline hover:text-gray-500"
					on:click={collapseDetails}
					disabled={vaultDetailsCollapsed}
				>
					Collapse All
				</button>
			</div>
		</div>
		{#each $vaults$ as vs (assetToString(vs.asset))}
			<Vaults
				item={vs}
				{loading}
				on:details-visible={updateToggleStatus}
				bind:collapseStatus={vaultDetailsStatus}
			/>
		{/each}
	</div>
</main>
