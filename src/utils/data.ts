import { getAddress as ethGetAddr } from '@ethersproject/address';
import BigNumber from 'bignumber.js';

import type * as TN from '@xchainjs/xchain-thornode';

import { v4 as uuidv4 } from 'uuid';

import {
	type Chain,
	baseAmount,
	type Asset,
	type BaseAmount,
	type Address,
	assetFromString,
	assetToString,
	bnOrZero,
	baseToAsset,
	type AssetAmount,
	eqAsset,
	bn,
	assetAmount
} from '@xchainjs/xchain-util';
import * as FP from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';
import * as M from 'fp-ts/lib/Monoid';
import type {
	NodesData,
	NodesDataMap,
	PoolsDataMap,
	PoolStatus,
	Vault,
	VaultData,
	VaultList,
	VaultListData,
	VaultMembers,
	VaultMemberships,
	VaultStatus,
	VaultType
} from 'src/types/types';
import {
	AssetRuneNative,
	AVAXChain,
	BCHChain,
	BNBChain,
	BTCChain,
	DOGEChain,
	ETHChain,
	GAIAChain,
	LTCChain,
	THORChain,
	THORNODE_DECIMAL
} from '../stores/const';
import type { PoolDetail, PoolDetails } from '@xchainjs/xchain-midgard';
import {
	monoidAssetAmount,
	monoidBaseAmount,
	ordVaultDataByTypeStatusReverse,
	sequenceSOption,
	unionString
} from './fp';
import { derived, type Readable, type Writable } from 'svelte/store';
import { NodeStatusEnum } from '@xchainjs/xchain-thornode';

/**
 * Helper to convert decimals
 * e.g.
 * ETH.ETH: 1e8 -> 1e18
 * ETH.USDT: 1e8 -> 1e6
 * COPIED from ASGARDEX
 * @see https://github.com/thorchain/asgardex-electron/blob/681b5f1231b43b63f8861a775d139ca6826b02b8/src/renderer/helpers/assetHelper.ts#L293
 */
export const convertBaseAmountDecimal = (amount: BaseAmount, decimal: number): BaseAmount => {
	const decimalDiff = decimal - amount.decimal;

	const amountBN =
		decimalDiff < 0
			? amount
					.amount()
					.dividedBy(bn(10 ** (decimalDiff * -1)))
					.decimalPlaces(0, BigNumber.ROUND_DOWN)
			: amount.amount().multipliedBy(bn(10 ** decimalDiff));
	return baseAmount(amountBN, decimal);
};

/** Helper to convert Writable -> Readable */
export const toReadable = <T>(v$$: Writable<T>): Readable<T> => derived(v$$, FP.identity);

export const toVaults = (vaults: TN.Vault[]): Vault[] =>
	FP.pipe(
		vaults,
		A.map((vault) => ({
			id: vault?.pub_key ?? uuidv4(),
			member: vault?.membership ?? [],
			type: toVaultType(vault?.type),
			addresses: vault.addresses,
			status: (vault?.status ?? 'unknown') as VaultStatus,
			coins: vault.coins,
			members: vault?.membership ?? []
		}))
	);

export const toNodesDataMap = (nodes: TN.Node[]): NodesDataMap =>
	FP.pipe(
		nodes,
		A.reduce<TN.Node, NodesDataMap>(new Map(), (acc, cur: TN.Node) => {
			const { status, total_bond, node_address, pub_key_set } = cur;
			const pubKeySecp256k1 = pub_key_set.secp256k1;
			// Accept active nodes and data w/ pubKey only
			if (status === NodeStatusEnum.Active && pubKeySecp256k1) {
				const bondAmount = baseAmount(total_bond, THORNODE_DECIMAL);
				return acc.set(pubKeySecp256k1, {
					bondAmount,
					nodeStatus: status,
					nodeAddress: node_address,
					pubKeySecp256k1
				});
			} else {
				return acc;
			}
		})
	);

export const filterNodes = (nodes: TN.Node[], status: TN.NodeStatusEnum) =>
	FP.pipe(
		nodes,
		A.filter((node) => node.status === status)
	);

export const toPoolsDataMap = (pools: PoolDetails): PoolsDataMap =>
	FP.pipe(
		pools,
		A.reduce<PoolDetail, PoolsDataMap>(new Map(), (acc, cur: PoolDetail) =>
			FP.pipe(
				cur.asset,
				assetFromString,
				O.fromNullable,
				O.fold(
					() => acc,
					(asset) => {
						const decimalInt = Number.parseInt(cur.nativeDecimal);
						const decimal = !isNaN(decimalInt) && decimalInt > -1 ? decimalInt : THORNODE_DECIMAL;
						return acc.set(cur.asset, {
							asset,
							status: (cur.status || 'unknown') as PoolStatus,
							assetPriceUSD: bnOrZero(cur.assetPriceUSD),
							decimal
						});
					}
				)
			)
		)
	);

export const getAddress = (addresses: TN.VaultAddress[], chain: string): O.Option<Address> =>
	FP.pipe(
		addresses,
		A.findFirst(({ chain: c, address }) => c === chain && !!address),
		O.map(({ address }) => address)
	);

export const getAssetPriceUSD = (asset: Asset, poolsData: PoolsDataMap): O.Option<BigNumber> =>
	FP.pipe(
		poolsData.get(assetToString(asset)),
		O.fromNullable,
		O.map(({ assetPriceUSD }) => assetPriceUSD)
	);

export const getPrice = ({
	asset,
	amount,
	poolsData
}: {
	asset: Asset;
	amount: BaseAmount;
	poolsData: PoolsDataMap;
}): O.Option<AssetAmount> =>
	FP.pipe(
		getAssetPriceUSD(asset, poolsData),
		O.map((price) => {
			const _assetAmount = baseToAsset(amount);
			return assetAmount(_assetAmount.amount().times(price), _assetAmount.decimal);
		})
	);

export const getDecimal = (asset: Asset, poolsData: PoolsDataMap): number =>
	FP.pipe(
		poolsData.get(assetToString(asset)),
		O.fromNullable,
		O.map(({ decimal }) => decimal),
		O.getOrElse(() => THORNODE_DECIMAL)
	);

export const getPoolStatus = (asset: Asset, poolsData: PoolsDataMap): PoolStatus =>
	FP.pipe(
		poolsData.get(assetToString(asset)),
		O.fromNullable,
		O.map((data) => data?.status ?? 'unknown'),
		O.getOrElse(() => 'unknown')
	);

const toVaultType = (type?: TN.VaultTypeEnum): VaultType => {
	switch (type) {
		case 'AsgardVault':
			return 'asgard';
		case 'YggdrasilVault':
			return 'ygg';
		default:
			return 'unknown';
	}
};

const toVaultMembers = ({
	members,
	nodesData
}: {
	members: string[];
	nodesData: NodesDataMap;
}): VaultMembers =>
	FP.pipe(
		members,
		A.filterMap((member) =>
			FP.pipe(
				nodesData.get(member),
				O.fromNullable,
				O.map((data) => data.nodeAddress)
			)
		)
	);

const toNodeMemberships = (pubKeySecp256k1: string, vaults: Vault[]): VaultMemberships =>
	FP.pipe(
		vaults,
		A.reduce([], (acc, curr: Vault) => {
			if (curr.members.includes(pubKeySecp256k1)) {
				return [...acc, { type: curr.type, address: curr.id }];
			}
			return acc;
		})
	);

const toVaultData = ({
	vault,
	poolsData,
	nodesData
}: {
	vault: Vault;
	poolsData: PoolsDataMap;
	nodesData: NodesDataMap;
}): VaultData[] =>
	FP.pipe(
		vault.coins || [], // Important note: coins can be null while churning!
		A.filterMap((coin) => {
			return FP.pipe(
				assetFromString(coin.asset),
				O.fromNullable,
				O.map<Asset, VaultData>((asset: Asset) => {
					const amount =
						// coin.amount is 1e8 by default, but it needs to be converted to whatever the original decimal is
						convertBaseAmountDecimal(
							baseAmount(coin.amount, THORNODE_DECIMAL),
							getDecimal(asset, poolsData)
						);

					const type = vault.type;
					const vaultData: VaultData = {
						id: vault.id,
						asset,
						address: getAddress(vault.addresses, asset.chain),
						amount,
						amountUSD: getPrice({ asset, amount, poolsData }),
						type,
						status: (vault?.status ?? 'unknown') as VaultStatus,
						members: toVaultMembers({ members: vault.members, nodesData }),
						memberships: []
					};

					return vaultData;
				})
			);
		})
	);

/**
 * Takes vaults (asgard and/or ygg) to get value of assets
 */
export const toVaultList = ({
	vaults,
	poolsData,
	nodesData
}: {
	vaults: Vault[];
	poolsData: PoolsDataMap;
	nodesData: NodesDataMap;
}): VaultList =>
	FP.pipe(
		vaults,
		// get VaultData
		A.map((vault: Vault) => toVaultData({ vault, poolsData, nodesData })),
		A.flatten,
		// ignore zero balances
		A.filter(({ amount }: VaultData) => amount.gt(baseAmount(0))),
		// Transform [VaultData] -> [{asset: Asset, data: VaultData}]
		A.reduce<VaultData, Array<Pick<VaultListData, 'asset' | 'data'>>>(
			[],
			(acc, data: VaultData) => {
				const index = acc.findIndex((el) => eqAsset(el.asset, data.asset));
				if (index !== -1) {
					acc[index] = { asset: data.asset, data: [...acc[index].data, data] };
				} else {
					acc.push({ asset: data.asset, data: [data] });
				}
				return acc;
			}
		),
		// Add total + totalUSD
		A.map<Pick<VaultListData, 'asset' | 'data'>, VaultListData>((v) => ({
			...v,
			total: sumAmounts(v.data),
			totalUSD: O.some(sumUSDAmounts(v.data)),
			assetPriceUSD: getAssetPriceUSD(v.asset, poolsData)
		})),
		// sort data
		A.map<VaultListData, VaultListData>((v) => ({
			...v,
			data: FP.pipe(v.data, A.sort(ordVaultDataByTypeStatusReverse))
		}))
	);

/**
 * Takes vaults (asgard and/or ygg) to get value of assets
 */
export const toNodesVaultList = ({
	vaults,
	runeUSDPrice,
	nodesData
}: {
	vaults: Vault[];
	runeUSDPrice: BigNumber;
	nodesData: NodesDataMap;
}): VaultList => {
	const members = FP.pipe(
		vaults,
		A.map((vault: Vault) =>
			FP.pipe(
				vault.members,
				A.reduce([], (acc, member) => (member ? [...acc, member] : acc))
			)
		),
		A.flatten,
		// remove duplications
		(members) => unionString(members)(members)
	);

	const vaultData = FP.pipe(
		members,
		A.filterMap((member) => {
			const oNodeData = O.fromNullable(nodesData.get(member));
			const oAsset = O.fromNullable(assetFromString('THOR.RUNE'));
			return FP.pipe(
				sequenceSOption({ node: oNodeData, asset: oAsset }),
				O.map<{ node: NodesData; asset: Asset }, VaultData>(
					({ node: { nodeAddress, bondAmount, nodeStatus, pubKeySecp256k1 }, asset }) => ({
						id: pubKeySecp256k1,
						asset,
						address: O.some(nodeAddress),
						amount: bondAmount,
						type: 'node',
						status: nodeStatus,
						amountUSD: O.some(
							baseToAsset(bondAmount).times(assetAmount(runeUSDPrice, THORNODE_DECIMAL))
						),
						memberships: toNodeMemberships(pubKeySecp256k1, vaults),
						members: []
					})
				)
			);
		}),
		(nodeVaults) => ({
			asset: AssetRuneNative,
			total: sumAmounts(nodeVaults),
			totalUSD: O.some(sumUSDAmounts(nodeVaults)),
			assetPriceUSD: O.some(runeUSDPrice),
			data: nodeVaults
		})
	);

	return [vaultData];
};

export const sumAmounts = (amounts: Array<Pick<VaultData, 'amount'>>): BaseAmount => {
	const decimal = FP.pipe(
		amounts,
		A.map(({ amount }) => amount),
		A.head,
		O.map(({ decimal }) => decimal),
		O.getOrElse(() => THORNODE_DECIMAL)
	);

	return FP.pipe(
		amounts,
		A.map(({ amount }) => amount),
		M.concatAll(monoidBaseAmount(decimal))
	);
};

export const sumUSDAmounts = (amounts: Array<Pick<VaultData, 'amountUSD'>>): AssetAmount => {
	const decimal = FP.pipe(
		amounts,
		A.filterMap(({ amountUSD }) => amountUSD),
		A.head,
		O.map(({ decimal }) => decimal),
		O.getOrElse(() => THORNODE_DECIMAL)
	);

	return FP.pipe(
		amounts,
		A.filterMap(({ amountUSD }) => amountUSD),
		M.concatAll(monoidAssetAmount(decimal))
	);
};

export const trimAddress = (addr: Address) => {
	const l = addr.length;
	return l <= 10 ? addr : `${addr.substring(0, 6)}...${addr.substring(l - 4)}`;
};

export const getEthTokenAddress = (asset: Asset): Address =>
	FP.pipe(
		// strip 0X only - 0x is still valid
		asset.symbol.slice(asset.ticker.length + 1).replace(/^0X/, ''),
		ethGetAddr
	);

export const getNoVaultsFromVaultList = ({
	type,
	list,
	status
}: {
	type: VaultType;
	list: VaultList;
	status?: VaultStatus;
}): number =>
	FP.pipe(
		list,
		A.map(({ data }) =>
			FP.pipe(
				data,
				A.filter((d) => d.type === type && (status ? d.status === status : true))
			)
		),
		A.flatten,
		A.map(({ id }) => id),
		(vaultIds) => unionString(vaultIds)(vaultIds),
		(vaultIds) => vaultIds.length
	);

export const getNoVaultsFromVaultData = (type: VaultType, list: VaultData[]): number =>
	FP.pipe(
		list,
		A.reduce(0, (acc, curr) => (curr.type === type ? acc + 1 : acc))
	);

export const getNoVaultsFromVaultMemberships = (
	type: VaultType,
	members: VaultMemberships
): number =>
	FP.pipe(
		members,
		A.reduce(0, (acc, curr) => (curr.type === type ? acc + 1 : acc))
	);

export const getExplorerAddressUrl = (chain: Chain, address: Address) => {
	switch (chain) {
		case AVAXChain:
			return `https://snowtrace.io/address/${address}`;
		case BNBChain:
			return `https://explorer.binance.org/address/${address}`;
		case BTCChain:
			return `https://blockstream.info/address/${address}`;
		case BCHChain:
			return `https://www.blockchain.com/bch/address/${address}`;
		case LTCChain:
			return `https://blockchair.com/litecoin/address/${address}`;
		case DOGEChain:
			return `https://blockchair.com/dogecoin/address/${address}`;
		case GAIAChain:
			return `https://cosmos.bigdipper.live/account/${address}`;
		case THORChain:
			return `https://thorchain.net/node/${address}`;
		case ETHChain:
			return `https://etherscan.io/address/${address}`;
	}
};
