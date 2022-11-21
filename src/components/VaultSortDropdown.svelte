<script lang="ts">
	import { VAULT_SORT_LABEL_MAP } from '../utils/renderer';
	import { createEventDispatcher } from 'svelte';
	import type { VaultSort } from '../types/types';

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
          text-gray-500 hover:shadow-lg
          focus:ring-0
        "
		type="button"
		id="dropdownMenuButton"
		data-bs-toggle="dropdown"
		aria-expanded="false"
	>
		<span class="flex-grow">{VAULT_SORT_LABEL_MAP[current]}</span>
		<svg
			data-prefix="fas"
			data-icon="caret-down"
			class="ml-2 w-2"
			role="img"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 320 512"
		>
			<path
				fill="currentColor"
				d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"
			/>
		</svg>
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
        "
		aria-labelledby="dropdownMenuButton"
	>
		{#each Object.entries(VAULT_SORT_LABEL_MAP) as [key, label] (key)}
			{@const selected = key === current}
			<li>
				<button
					disabled={selected}
					class="
            {selected ? 'bg-gray-200' : ''}
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
            "
					on:click={() => dispatch('item-selected', key)}
				>
					{label}
				</button>
			</li>
		{/each}
	</ul>
</div>
