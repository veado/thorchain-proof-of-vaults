<script lang="ts">
	import { VAULT_SORT_LABEL_MAP } from '../utils/renderer';
	import { createEventDispatcher } from 'svelte';
	import type { VaultSort } from '../types/types';

	import { ChevronDownIcon } from '@krowten/svelte-heroicons';

	export let current: VaultSort = 'usd';

	let className = '';
	export { className as class };

	const dispatch = createEventDispatcher();
</script>

<div class="dropdown relative {className}">
	<button
		class="
    dropdown-toggle
    flex
    w-full
          min-w-max
          items-center
          whitespace-nowrap
          border
          border-solid
          border-gray-400
          bg-white
          px-3
          py-1.5
          text-start
          text-gray-400
          hover:border-gray-500
          hover:text-gray-500 hover:shadow-lg focus:ring-0 dark:border-gray-300 dark:bg-gray-900
          dark:text-gray-200 dark:hover:border-gray-100
          dark:hover:text-gray-100
        "
		type="button"
		id="dropdownMenuButton"
		data-bs-toggle="dropdown"
		aria-expanded="false"
	>
		<span class="flex-grow">{VAULT_SORT_LABEL_MAP[current]}</span>
		<ChevronDownIcon class="ml-2 h-4 w-4" />
	</button>
	<ul
		class="
    dropdown-menu
          absolute
          z-50
          float-left
          m-0
          mt-1
          hidden
          w-full
          list-none
          border-none
          bg-white
          bg-clip-padding
          py-2
          text-left
          shadow-lg
          dark:bg-gray-900
        "
		aria-labelledby="dropdownMenuButton"
	>
		{#each Object.entries(VAULT_SORT_LABEL_MAP) as [key, label] (key)}
			{@const selected = key === current}
			<li>
				<button
					disabled={selected}
					class="
            {selected ? 'bg-gray-100 dark:bg-gray-800' : ''}
              dropdown-item
              block
              w-full
              whitespace-nowrap
              bg-transparent
              py-2 px-4
              text-left
              text-gray-500
              hover:bg-gray-100
              hover:text-gray-700
              dark:text-gray-200
              dark:hover:bg-gray-800
              dark:hover:text-gray-100
            "
					on:click={() => dispatch('item-selected', key)}
				>
					{label}
				</button>
			</li>
		{/each}
	</ul>
</div>
