<script lang="ts">
	import { MagnifyingGlassIcon, XMarkIcon } from '@krowten/svelte-heroicons';
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
		class="peer w-full appearance-none border border-gray-400 bg-white px-8 py-1.5 text-gray-400 placeholder:uppercase 
    hover:border-gray-500 hover:text-gray-500 
    hover:shadow-lg focus:border-gray-500 focus:text-gray-500 focus:shadow-lg focus:outline-none dark:border-gray-300
    dark:bg-gray-900 dark:text-gray-200 dark:focus:border-gray-200
    dark:focus:text-gray-100"
		{disabled}
		autoComplete="off"
		value={searchTxt}
		on:keydown={onKeyDownHandler}
		on:input={onChangeHandler}
	/>
	<MagnifyingGlassIcon
		class="absolute left-2 top-[50%] h-5 w-5 translate-y-[-50%] text-gray-400 peer-focus:text-gray-500 dark:text-gray-200 dark:peer-focus:text-gray-100 {disabled
			? 'cursor-not-allowed opacity-50'
			: 'cursor-pointer'}"
		on:click={onSearch}
	/>
	<button
		type="button"
		class="absolute right-2 top-[50%] h-5 w-5 translate-y-[-50%] text-gray-500 dark:text-gray-200 {searchTxt.length <
		1
			? 'hidden'
			: 'block'}"
		on:click={onCancel}
	>
		<XMarkIcon class="h-4 w-4" />
	</button>
</div>
