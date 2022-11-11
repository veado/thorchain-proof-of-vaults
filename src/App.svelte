<script lang="ts">
	import logo from './assets/logo.png';
	import * as FP from 'fp-ts/lib/function';

	import { asgardsAD$, reloadAsgards } from './stores/vaults';
	import * as AD from './utils/async';
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
		<p class="text-lg text-center uppercase text-gray-300">coming soon</p>
		<button on:click={reloadAsgards}>Reload asgards</button>
		<div>
			{FP.pipe(
				$asgardsAD$,
				AD.foldA(
					() => '...',
					(error) => error.toString(),
					(result) => `ASGARDS no ${result.length}`
				)
			)}
		</div>
	</div>
</main>
