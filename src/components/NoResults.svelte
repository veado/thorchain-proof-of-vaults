<script>
	import { DocumentSearchIcon } from '@krowten/svelte-heroicons';

	let className = '';
	export { className as class };
</script>

<div
	class="xl:py-30 flex flex-col items-center justify-center py-20 px-5 text-gray-400 {className}"
>
	<DocumentSearchIcon class="h-20 w-20 " />
	<p class="">No results</p>
</div>
