<script>
	import { ExclamationIcon } from '@krowten/svelte-heroicons';
	import { plural } from '../utils/renderer';

	let className = '';
	export { className as class };

	export let noActiveAsgards = 0;
	export let noRetiringAsgards = 0;
	const noTotaAsgards = noRetiringAsgards + noActiveAsgards;
</script>

<div
	class="flex items-center justify-center border-b-2 border-yellow-500 bg-white px-2 py-1 text-yellow-500 dark:bg-gray-800 {className}"
>
	<ExclamationIcon class="mr-1 h-6 w-6 sm:h-4 sm:w-4" />
	<h2 class="text-center text-xs sm:text-sm">
		Migration of {noTotaAsgards} <span class="uppercase">{plural('asgard', noTotaAsgards)}</span>
		in progress
		<span class="block sm:inline-block"
			>({noRetiringAsgards} retiring / {noActiveAsgards} active)</span
		>
	</h2>
</div>
