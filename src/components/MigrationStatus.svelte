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
	class="flex items-center justify-center bg-yellow-500 px-2 text-white dark:bg-yellow-800 dark:text-gray-200 {className}"
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
