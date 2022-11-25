<script type="ts">
	import { createPopperActions } from 'svelte-popperjs';
	import { fade } from 'svelte/transition';
	const [popperRef, popperContent] = createPopperActions({
		placement: 'top',
		strategy: 'fixed'
	});
	const extraOpts = {
		modifiers: [{ name: 'offset', options: { offset: [0, 8] } }]
	};

	let className = '';
	export { className as class };
	let classNameTooltip = '';
	export { classNameTooltip as classTooltip };
	export let tooltip = '';

	let showTooltip = false;
</script>

<div
	class={className}
	use:popperRef
	on:touchend={() => (showTooltip = true)}
	on:mouseenter={() => (showTooltip = true)}
	on:mouseleave={() => (showTooltip = false)}
>
	<slot />
</div>
{#if showTooltip}
	<div
		transition:fade={{ duration: 200 }}
		class="relative bg-gray-400 text-xs uppercase text-gray-50 {classNameTooltip}"
		use:popperContent={extraOpts}
	>
		<!--
      tooltip content can be replaced by adding another content to this slot
      e.g. <div `slot="tooltip">...</div>`
      see `Vault.svelte`
    -->
		<slot name="tooltip"><div class="px-2 py-1">{tooltip}</div></slot>

		<div
			class="invisible absolute h-2 w-2 bg-inherit after:visible after:absolute after:h-2 after:w-2 after:translate-y-[-50%] after:rotate-45 after:bg-inherit after:content-['']"
			data-popper-arrow
		/>
	</div>
{/if}
