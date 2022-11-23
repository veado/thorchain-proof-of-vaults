<script lang="ts">
	import { SearchIcon, XIcon } from '@krowten/svelte-heroicons';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let className = '';
	export { className as class };

	export let disabled = false;
	export let placeholder = '';

	let searchTxt = '';

	const onChangeHandler = (event: Event) => {
		const value = (event.currentTarget as HTMLInputElement).value;
		searchTxt = value;
		dispatch('change', searchTxt);
	};
	const onSearch = () => {
		dispatch('search', searchTxt);
	};
	const onCancel = () => {
		searchTxt = '';
		dispatch('cancel');
	};

	const onKeyDownHandler = ({ key }: KeyboardEvent) => {
		if (key === 'Enter') {
			onSearch();
		}
		if (key === 'Escape') {
			onCancel();
		}
	};
</script>

<div class="relative {className}">
	<input
		type="text"
		{placeholder}
		class="border-red peer w-full appearance-none border border-gray-400 px-8 py-1.5 text-gray-400 
    placeholder:uppercase hover:border-gray-500 
    hover:text-gray-500 hover:shadow-lg 
    focus:border-gray-500 focus:text-gray-500 focus:shadow-lg
    focus:outline-none"
		{disabled}
		autoComplete="off"
		value={searchTxt}
		on:keydown={onKeyDownHandler}
		on:input={onChangeHandler}
	/>
	<SearchIcon
		class="absolute left-2 top-[50%] h-5 w-5 translate-y-[-50%] text-gray-400 peer-focus:text-gray-500 {disabled
			? 'cursor-not-allowed opacity-50'
			: 'cursor-pointer'}"
		on:click={onSearch}
	/>
	<button
		type="button"
		class="absolute right-2 top-[50%] h-5 w-5 translate-y-[-50%] text-gray-500 {searchTxt.length < 1
			? 'hidden'
			: 'block'}"
		on:click={onCancel}
	>
		<XIcon class="h-4 w-4" />
	</button>
</div>
