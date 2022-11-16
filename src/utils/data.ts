import type {
	Node,
	NodeStatusEnum,
	Vault,
	VaultAddress,
	VaultTypeEnum
} from '@xchainjs/xchain-thornode';
import {
	baseAmount,
	type Asset,
	type BaseAmount,
	type Address,
	assetFromString,
	assetToString,
	bnOrZero,
	baseToAsset,
	type AssetAmount,
	assetAmount,
	eqAsset
} from '@xchainjs/xchain-util';
import * as FP from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';
import * as M from 'fp-ts/lib/Monoid';
import type {
	BondsDataMap,
	NodesData,
	NodesMap,
	PoolsDataMap,
	PoolStatus,
	VaultData,
	VaultList,
	VaultListData,
	VaultStatus,
	VaultType
} from 'src/types/types';
import { THORNODE_DECIMAL } from '../stores/const';
import type { PoolDetail, PoolDetails } from '@xchainjs/xchain-midgard';
import { monoidAssetAmount, monoidBaseAmount, sequenceSOption } from './fp';

export const toNodesMap = (nodes: Node[]): NodesMap =>
	FP.pipe(
		nodes,
		A.reduce(new Map(), (acc, cur: Node) => {
			const sec = cur.pub_key_set.secp256k1;
			if (sec)
				return acc.set(sec, {
					bondAmount: baseAmount(cur.bond, THORNODE_DECIMAL),
					nodeStatus: cur.status,
					bondAddress: cur.bond_address
				});
			else return acc;
		})
	);

export const filterNodes = (nodes: Node[], status: NodeStatusEnum) =>
	FP.pipe(
		nodes,
		A.filter((node) => node.status === status)
	);

export const getPoolsData = (pools: PoolDetails): PoolsDataMap =>
	FP.pipe(
		pools,
		A.reduce<PoolDetail, PoolsDataMap>(new Map(), (acc, cur: PoolDetail) =>
			FP.pipe(
				cur.asset,
				assetFromString,
				O.fromNullable,
				O.fold(
					() => acc,
					(asset) =>
						acc.set(cur.asset, {
							asset,
							status: (cur.status || 'unknown') as PoolStatus,
							priceUSD: bnOrZero(cur.assetPrice),
							runeDepth: bnOrZero(cur.runeDepth)
						})
				)
			)
		)
	);

export const getTotalBonds = (members: Address[], nodes: NodesMap): BaseAmount =>
	FP.pipe(
		members,
		A.filterMap((member: string) => O.fromNullable(nodes.get(member).bondAmount)),
		A.reduce(baseAmount(0, THORNODE_DECIMAL), (acc, cur: BaseAmount) => acc.plus(cur))
	);

export const getAddress = (addresses: VaultAddress[], chain: string): O.Option<Address> =>
	FP.pipe(
		addresses,
		A.findFirst(({ chain: c, address }) => c === chain && !!address),
		O.map(({ address }) => address)
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
		poolsData.get(assetToString(asset)),
		O.fromNullable,
		O.map(({ priceUSD: price }) => baseToAsset(amount).times(assetAmount(price, THORNODE_DECIMAL)))
	);

export const getPoolStatus = (asset: Asset, poolsData: PoolsDataMap): PoolStatus =>
	FP.pipe(
		poolsData.get(assetToString(asset)),
		O.fromNullable,
		O.map((data) => data?.status ?? 'unknown'),
		O.getOrElse(() => 'unknown')
	);

const toVaultType = (type: VaultTypeEnum): VaultType => {
	switch (type) {
		case 'AsgardVault':
			return 'asgard';
		case 'YggdrasilVault':
			return 'ygg';
	}
};

const toVaultData = ({
	vault,
	poolsData
}: {
	vault: Vault;
	poolsData: PoolsDataMap;
}): VaultData[] =>
	FP.pipe(
		vault.coins || [], // Important note: coins can be null while churning!
		A.filterMap((coin) => {
			return FP.pipe(
				assetFromString(coin.asset),
				O.fromNullable,
				O.map<Asset, VaultData>((asset: Asset) => {
					const amount = baseAmount(coin.amount, coin?.decimals ?? THORNODE_DECIMAL);

					return {
						asset,
						address: getAddress(vault.addresses, asset.chain),
						amount: baseAmount(coin.amount, coin?.decimals ?? THORNODE_DECIMAL),
						amountUSD: getPrice({ asset, amount, poolsData }),
						type: vault.type ? toVaultType(vault.type) : 'unknown',
						status: (vault?.status ?? 'unknown') as VaultStatus
					};
				})
			);
		})
	);

/**
 * Takes vaults (asgard and/or ygg) to get value of assets
 */
export const toVaultList = ({
	vaults,
	poolsData
}: {
	vaults: Vault[];
	poolsData: PoolsDataMap;
}): VaultList =>
	FP.pipe(
		vaults,
		// get VaultData
		A.map((vault: Vault) => toVaultData({ vault, poolsData })),
		A.flatten,
		// ignore zero balances
		A.filter((v) => v.amount.gt(baseAmount(0))),
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
			totalUSD: O.some(sumUSDAmounts(v.data))
		}))
	);

/**
 * Takes vaults to get bonds of all members
 */
export const toNodesVaultDataMap = ({
	vaults,
	nodes,
	runeUSDPrice
}: {
	vaults: Vault[];
	nodes: NodesMap;
	runeUSDPrice: AssetAmount;
}): BondsDataMap =>
	FP.pipe(
		vaults,
		A.map((vault: Vault) =>
			FP.pipe(
				vault.membership,
				A.filterMap((member) => {
					const oNodeData = O.fromNullable(nodes.get(member));
					const oAsset = O.fromNullable(assetFromString('THOR.RUNE'));
					return FP.pipe(
						sequenceSOption({ node: oNodeData, asset: oAsset }),
						O.map<{ node: NodesData; asset: Asset }, VaultData>(
							({ node: { bondAddress, bondAmount, nodeStatus }, asset }) => ({
								asset,
								address: O.some(bondAddress),
								amount: bondAmount,
								type: 'bond',
								status: nodeStatus,
								amountUSD: O.some(baseToAsset(bondAmount).times(runeUSDPrice))
							})
						)
					);
				})
			)
		),
		A.flatten,
		(bondsData) => new Map([['THOR.RUNE', bondsData]])
	);

export const sumAmounts = (amounts: Array<Pick<VaultData, 'amount'>>): BaseAmount =>
	FP.pipe(
		amounts,
		A.map(({ amount }) => amount),
		M.concatAll(monoidBaseAmount)
	);

export const sumUSDAmounts = (amounts: Array<Pick<VaultData, 'amountUSD'>>): AssetAmount =>
	FP.pipe(
		amounts,
		A.filterMap(({ amountUSD }) => amountUSD),
		M.concatAll(monoidAssetAmount)
	);

export const trimAddress = (addr: Address) => {
	const l = addr.length;
	return l <= 8 ? addr : `${addr.substring(0, 4)}...${addr.substring(l - 4)}`;
};
