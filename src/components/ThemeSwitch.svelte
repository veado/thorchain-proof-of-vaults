<script lang="ts">
	import { theme$, setTheme } from '../stores/theme';

	import { MoonIcon, SunIcon } from '@krowten/svelte-heroicons';
</script>

<div class="flex-none">
	{#if $theme$ === 'light'}
		<button
			on:click={() => setTheme('dark')}
			class="ease rounded-full bg-gray-400 p-2 text-gray-100 hover:scale-110 hover:bg-gray-900 hover:text-yellow-400  hover:shadow-lg"
		>
			<MoonIcon class="h-5 w-5 text-inherit " />
		</button>
	{:else}
		<button
			on:click={() => setTheme('light')}
			class="ease rounded-full bg-gray-500 p-2 text-gray-100 hover:scale-110 hover:bg-gray-50 hover:text-yellow-400 hover:shadow-lg"
		>
			<SunIcon class="h-5 w-5 text-inherit " />
		</button>
	{/if}
</div>
