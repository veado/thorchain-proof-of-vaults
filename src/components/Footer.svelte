<script>
	import GithubIcon from './GithubIcon.svelte';

	const GH_URL = 'https://github.com/veado/thorchain-proof-of-vaults';
</script>

<footer class="container flex w-full flex-col items-center justify-center py-12">
	<a class="ease h-7 w-7 rounded-full text-gray-400 hover:scale-110 hover:text-tc" href={GH_URL}
		><GithubIcon class="" /></a
	>
	<a
		class="text-center text-[0.75em] text-gray-300 hover:text-tc"
		href="{GH_URL}/commit/{import.meta.env.VITE_COMMIT_HASH}"
	>
		<span>v{import.meta.env.VITE_VERSION}</span><br />
		<span>({import.meta.env.VITE_COMMIT_HASH})</span>
	</a>
</footer>
