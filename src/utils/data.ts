import type { Node, NodeStatusEnum, Vault, VaultAddress } from '@xchainjs/xchain-thornode';
import {
	baseAmount,
	type Asset,
	type BaseAmount,
	type Address,
	assetFromString,
	assetToString
} from '@xchainjs/xchain-util';
import BigNumber from 'bignumber.js';
import * as FP from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';
import * as M from 'fp-ts/lib/Monoid';
import type {
	BondsDataMap,
	NodeBondsMap,
	PoolsDataMap,
	VaultData,
	VaultDataMap,
	VaultType
} from 'src/types/types';
import { THORNODE_DECIMAL } from '../stores/const';
import type { PoolDetail, PoolDetails } from '@xchainjs/xchain-midgard';
import { monoidBaseAmount } from './fp';

export const getNodeBonds = (nodes: Node[]): NodeBondsMap =>
	FP.pipe(
		nodes,
		A.reduce(new Map(), (acc, cur: Node) => {
			const sec = cur.pub_key_set.secp256k1;
			if (sec) return acc.set(sec, baseAmount(cur.bond, THORNODE_DECIMAL));
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
		A.reduce(new Map(), (acc, cur: PoolDetail) =>
			acc.set(cur.asset, { status: cur.status, price: new BigNumber(cur.assetPrice) })
		)
	);

export const getTotalBonds = (members: Address[], bonds: NodeBondsMap): BaseAmount =>
	FP.pipe(
		members,
		A.filterMap((member: string) => O.fromNullable(bonds.get(member))),
		A.reduce(baseAmount(0, THORNODE_DECIMAL), (acc, cur: BaseAmount) => acc.plus(cur))
	);

const getAddress = (addresses: VaultAddress[], chain: string): O.Option<Address> =>
	FP.pipe(
		addresses,
		A.findFirst(({ chain: c, address }) => c === chain && !!address),
		O.map(({ address }) => address)
	);

const getPrice = ({
	asset,
	amount,
	poolsData
}: {
	asset: Asset;
	amount: BaseAmount;
	poolsData: PoolsDataMap;
}): O.Option<BaseAmount> =>
	FP.pipe(
		poolsData.get(assetToString(asset)),
		O.fromNullable,
		O.map(({ price }) => amount.times(baseAmount(price, THORNODE_DECIMAL)))
	);

const toVaultData = ({
	vault,
	poolsData,
	type
}: {
	vault: Vault;
	poolsData: PoolsDataMap;
	type: VaultType;
}) =>
	FP.pipe(
		vault.coins,
		A.filterMap((coin) =>
			FP.pipe(
				assetFromString(coin.asset),
				O.fromNullable,
				O.map<Asset, VaultData>((asset: Asset) => {
					const amount = baseAmount(coin.amount, coin?.decimals ?? THORNODE_DECIMAL);
					return {
						asset,
						address: getAddress(vault.addresses, asset.chain),
						amount: baseAmount(coin.amount, coin?.decimals ?? THORNODE_DECIMAL),
						price: getPrice({ asset, amount, poolsData }),
						type
					};
				})
			)
		)
	);

/**
 * Takes vaults (asgard or ygg) to get value of assets
 */
export const toVaultDataMap = ({
	vaults,
	poolsData,
	type
}: {
	vaults: Vault[];
	poolsData: PoolsDataMap;
	type: VaultType;
}): VaultDataMap =>
	FP.pipe(
		vaults,
		A.map((vault: Vault) => toVaultData({ vault, poolsData, type })),
		A.flatten,
		A.reduce(new Map<string, VaultData[]>(), (acc, data: VaultData) => {
			const assetString = assetToString(data.asset);
			const curr = acc.get(assetString);
			if (curr) {
				return acc.set(assetString, [...curr, data]);
			}
			return acc.set(assetString, [data]);
		})
	);

/**
 * Takes vaults to get bonds of all members
 */
export const toBondsMap = ({
	vaults,
	poolsData,
	bonds
}: {
	vaults: Vault[];
	poolsData: PoolsDataMap;
	bonds: NodeBondsMap;
}): BondsDataMap => {
	return FP.pipe(
		vaults,
		A.filterMap((vault: Vault) => {
			const totalBonds = getTotalBonds(vault.membership, bonds);
			const thorAddress = getAddress(vault.addresses, 'THOR');
			return FP.pipe(
				assetFromString('THOR.RUNE'),
				O.fromNullable,
				O.map<Asset, VaultData>((asset) => ({
					asset,
					address: thorAddress,
					amount: totalBonds,
					price: getPrice({ asset, amount: totalBonds, poolsData }),
					type: 'bond'
				}))
			);
		}),
		(bondsData) => new Map([['THOR.RUNE', bondsData]])
	);
};

export const sumAmounts = (amounts: Array<Pick<VaultData, 'amount'>>): BaseAmount =>
	FP.pipe(
		amounts,
		A.map(({ amount }) => amount),
		M.concatAll(monoidBaseAmount)
	);
