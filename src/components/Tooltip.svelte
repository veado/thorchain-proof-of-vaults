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
	let classNamePopup = '';
	export { classNamePopup as classPopup };
	export let tooltip;

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
{#if showTooltip && tooltip}
	<div
		transition:fade={{ duration: 200 }}
		class="relative bg-gray-400 text-xs uppercase text-gray-50 {classNamePopup}"
		use:popperContent={extraOpts}
	>
		<!-- Note: padding needs to be here to position arrow properly -->
		<div class="px-2 py-1">{tooltip}</div>
		<!-- arrow -->
		<div
			class="invisible absolute h-2 w-2 bg-inherit after:visible after:absolute after:h-2 after:w-2 after:translate-y-[-50%] after:rotate-45 after:bg-inherit after:content-['']"
			data-popper-arrow
		/>
	</div>
{/if}

<style>
	#tooltip {
		background: #333;
		color: white;
		font-weight: bold;
		padding: 4px 8px;
		font-size: 13px;
		border-radius: 4px;
	}
	#arrow,
	#arrow::before {
		position: absolute;
		width: 8px;
		height: 8px;
		background: inherit;
	}

	#arrow {
		visibility: hidden;
	}

	#arrow::before {
		visibility: visible;
		content: '';
		transform: rotate(45deg);
	}
</style>
