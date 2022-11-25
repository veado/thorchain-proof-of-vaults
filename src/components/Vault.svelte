<script lang="ts">
	import type { VaultData } from 'src/types/types';
	import * as FP from 'fp-ts/lib/function';
	import * as O from 'fp-ts/lib/Option';
	import { sequenceSOption } from '../utils/fp';
	import {
		assetFromString,
		AssetRuneNative,
		baseToAsset,
		Chain,
		eqAsset,
		formatAssetAmountCurrency,
		type Address
	} from '@xchainjs/xchain-util';
	import { ExternalLinkIcon } from '@krowten/svelte-heroicons';
	import {
		bgColorByVaultStatus,
		labelByVaultStatus,
		labelByVaultType,
		plural
	} from '../utils/renderer';
	import {
		getExplorerAddressUrl,
		getNoVaultsFromVaultMemberships,
		trimAddress
	} from '../utils/data';

	import Tooltip from './Tooltip.svelte';

	export let data: VaultData;
	let className = '';
	export { className as class };

	const {
		id,
		type,
		asset,
		status,
		amount,
		amountUSD,
		address: oAddress,
		members,
		memberships
	} = data;

	const addr = FP.pipe(
		oAddress,
		O.getOrElse(() => '')
	);

	const hasMemberships = type === 'node' && memberships.length;

	const noAsgardMemberships = getNoVaultsFromVaultMemberships('asgard', memberships);
	const noYggMemberships = getNoVaultsFromVaultMemberships('ygg', memberships);

	const membershipLabel = () => {
		let tooltip = '';
		if (hasMemberships) {
			tooltip = 'Member of ';
			if (!!noAsgardMemberships) {
				tooltip += `${noAsgardMemberships} ${plural('Asgard', noAsgardMemberships)}`;
			}
			if (!!noAsgardMemberships && noYggMemberships) {
				tooltip += ` + `;
			}
			if (noYggMemberships > 0) {
				tooltip += `${noYggMemberships} ${plural('Yggdrasil', noYggMemberships)}`;
			}
		}

		return tooltip;
	};

	const hasMembers = type !== 'node' && members.length;

	const membersLabel = hasMembers
		? `Managed by ${members.length} ${plural('node', members.length)}`
		: '';

	const onClickAddress = (address: Address, chain: Chain) => {
		const url = getExplorerAddressUrl(chain, address);
		window.open(url);
	};
</script>

<div class="flex flex-col items-center rounded-lg bg-gray-50 pb-4 {className}">
	<Tooltip
		class="flex w-full cursor-default items-center justify-center rounded-t-lg bg-gray-100 py-2 px-2 text-center text-sm font-semibold uppercase text-gray-500"
	>
		<!-- status icon -->
		<span class="{bgColorByVaultStatus(status)} mr-1 block h-2 w-2 rounded-full" />
		<!-- status label -->
		{labelByVaultType(type)}
		<!--
      Custom tooltip content
		  Note: fragment is need to define @const only
      in other case `<div slot="tooltip">...</div> would just work w/o an outher fragment
    -->
		<svelte:fragment slot="tooltip">
			{@const vaultId = eqAsset(asset, AssetRuneNative) ? addr : id}
			<div class="px-2 py-2 text-center">
				<h1 class="mb-1 font-semibold">{labelByVaultStatus(status)} {labelByVaultType(type)}</h1>
				<span class="normal-case">.{vaultId.slice(-4) || vaultId}</span>
			</div>
		</svelte:fragment>
	</Tooltip>

	<div class="pt-2 text-xs uppercase text-gray-400">
		{membershipLabel()}
		<Tooltip class="cursor-default"
			>{membersLabel}
			<div class="flex flex-col items-center justify-center px-2 py-2" slot="tooltip">
				<h1 class="mb-1 font-semibold">{plural('node', members.length)}</h1>
				{#if members.length >= 3}
					<div class="grid grid-cols-3 gap-1 normal-case">
						{#each members as member}
							<div>.{member.slice(-4)}</div>
						{/each}
					</div>
				{:else}
					<div class="normal-case">
						{#each members as member}
							<div class="mr-1 last:ml-0">.{member.slice(-4)}</div>
						{/each}
					</div>
				{/if}
			</div>
		</Tooltip>
	</div>
	<div class="pt-4 text-xl leading-none text-gray-600">
		{formatAssetAmountCurrency({
			amount: baseToAsset(amount),
			asset,
			decimal: 6,
			trimZeros: true
		})}
	</div>
	<div class="pt-2 text-base leading-none  text-gray-400">
		{FP.pipe(
			sequenceSOption({
				asset: O.fromNullable(assetFromString('BNB.BUSD')),
				amount: amountUSD
			}),
			O.map(({ asset, amount }) =>
				formatAssetAmountCurrency({ amount, asset, decimal: 2, trimZeros: false })
			),
			O.getOrElse(() => '$ unknown price')
		)}
	</div>

	{#if !!addr}
		<button
			class="flex cursor-pointer items-center justify-center pt-3 pb-1 text-base text-gray-500 hover:text-tc"
			alt={addr}
			on:click={() => onClickAddress(addr, asset.chain)}
		>
			{trimAddress(addr)}
			<ExternalLinkIcon class="ml-1 h-4 w-4" />
		</button>
	{/if}
</div>
