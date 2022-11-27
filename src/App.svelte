<script lang="ts">
	import logo from './assets/logo.png';

	import { assetToString } from '@xchainjs/xchain-util';

	import {
		dataRD$,
		loadAllData,
		vaultsSorted$ as vaults$,
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
	import NoResults from './components/NoResults.svelte';
	import * as FP from 'fp-ts/lib/function';
	import Error from './components/Error.svelte';
	import Footer from './components/Footer.svelte';

	$: loading = RD.isPending($dataRD$);
	$: error = FP.pipe(
		$dataRD$,
		RD.fold(
			() => '',
			() => '',
			(error) => error.message || error.toString(),
			() => ''
		)
	);

	const onSearchHandler = ({ detail: search }: CustomEvent<string>) => {
		vaultSearch$$.set(search);
	};

	const onCancelSearchHandler = () => {
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

<div class="flex flex-col px-5 md:px-10  xl:px-20">
	<!-- logo + title -->
	<header class="container flex flex-col items-center bg-gray-50 py-10">
		<a href="https://thorchain.org/" class="">
			<img
				src={logo}
				class="ease h-[60px] w-[60px] max-w-full rounded-full border-8 border-black hover:scale-110 hover:shadow-xl"
				alt=""
			/>
		</a>
		<h1 class="mt-2 text-2xl uppercase text-gray-900">Proof Of Vaults</h1>
	</header>
	<div class="container flex flex-col bg-white shadow-md">
		<nav class="w-full bg-gray-200 py-5 px-5 md:px-10 ">
			<!-- sort / search -->
			<div class="flex flex-col items-center lg:flex-row">
				<div class="flex w-full flex-col items-center justify-center md:w-auto md:flex-row">
					<VaultSortDropdown
						class="w-full md:w-[150px]"
						current={$vaultSort$$}
						on:item-selected={({ detail }) => vaultSort$$.set(detail)}
					/>
					<SearchInput
						class="mt-2 ml-0 w-full md:mt-0 md:ml-10 md:w-[300px]"
						placeholder="Search assets"
						on:search={onSearchHandler}
						on:change={onSearchHandler}
						on:cancel={onCancelSearchHandler}
					/>
				</div>

				<!-- collapse / expand -->
				<div class="mt-2 flex flex-1 items-center justify-end lg:mt-0">
					<button
						class="ml-2 text-gray-400 underline hover:text-tc"
						on:click={expandDetails}
						disabled={vaultDetailsExpanded}
					>
						Expand All
					</button>
					<button
						class="ml-2 text-gray-400 underline hover:text-tc"
						on:click={collapseDetails}
						disabled={vaultDetailsCollapsed}
					>
						Collapse All
					</button>
				</div>
			</div>
		</nav>

		<!-- reload -->

		<div class="mt-10 flex w-full flex-col items-center">
			<button
				class="flex w-auto items-center rounded-full
           bg-gray-400 px-6 py-1 text-lg uppercase text-white
            hover:bg-tc 
         hover:shadow-lg {loading ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
         ease
         "
				on:click={loadAllData}
				disabled={loading}
			>
				<LoaderIcon class="mr-2 {!loading ? 'hidden' : ''}" />
				Reload Vaults
			</button>

			<div class="form-check mt-2">
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
          align-top checked:border-none checked:bg-gray-400 focus:outline-none"
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

		<main class="p-5 md:p-10">
			{#if error}
				<Error {error} />
			{/if}
			{#if !$vaults$.length && loading}
				<div class="flex w-full justify-center py-40">
					<LoaderIcon class="!h-10 !w-10 text-gray-300" />
				</div>
			{/if}
			{#if $vaults$.length}
				{#each $vaults$ as vs (assetToString(vs.asset))}
					<Vaults
						item={vs}
						{loading}
						on:details-visible={updateToggleStatus}
						bind:collapseStatus={vaultDetailsStatus}
					/>
				{/each}
			{/if}
			{#if !$vaults$.length && RD.isSuccess($dataRD$)}
				<NoResults class="" />
			{/if}
		</main>
	</div>
	<Footer />
</div>
