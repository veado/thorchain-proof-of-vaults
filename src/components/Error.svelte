<script>
	import { ExclamationCircleIcon } from '@krowten/svelte-heroicons';

	let className = '';
	export { className as class };

	export let error = '';
</script>

<div
	class="xl:py-30 flex flex-col items-center justify-center py-20 px-10 text-red-500 {className}"
>
	<ExclamationCircleIcon class="h-20 w-20 " />
	<h1 class="text-xl uppercase">Error</h1>
	{#if error}
		<h2 class="error pt-2 text-center text-gray-400">{error}</h2>
	{/if}
</div>
