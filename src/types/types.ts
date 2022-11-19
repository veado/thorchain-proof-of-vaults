import type { Node, NodeStatusEnum } from '@xchainjs/xchain-thornode';
import type * as O from 'fp-ts/lib/Option';
import type * as RD from '@devexperts/remote-data-ts';
import type BigNumber from 'bignumber.js';
import type { BaseAmount, Address, Asset, AssetAmount } from '@xchainjs/xchain-util';

export type VaultType = 'asgard' | 'ygg' | 'bond' | 'unknown';
export type VaultStatus =
	| 'RetiringVault'
	| 'ActiveVault'
	| NodeStatusEnum
	| 'Active'
	| 'Standby'
	| 'unknown';

export type VaultData = {
	asset: Asset;
	address: O.Option<Address>;
	amount: BaseAmount;
	amountUSD: O.Option<AssetAmount>;
	type: VaultType;
	status: VaultStatus;
};

export type BondsDataMap = Map<'THOR.RUNE', VaultData[]>;

export type VaultListData = {
	asset: Asset;
	total: BaseAmount;
	totalUSD: O.Option<AssetAmount>;
	data: VaultData[];
};

export type VaultList = VaultListData[];

export type DataAD = RD.RemoteData<
	Error,
	{ vaults: VaultList; pools: PoolsDataMap; nodes: Node[] }
>;

export type NodeBondsMap = Map<Address, BaseAmount>;
export type NodesData = {
	bondAmount: BaseAmount;
	nodeStatus: NodeStatusEnum;
	bondAddress: Address;
};
export type NodesMap = Map<Address, NodesData>;

/**
 * PoolStatus
 * Type is missing in generated types of xchain-midgard
 */
export type PoolStatus = 'available' | 'staged' | 'suspended' | 'unknown';
export type PoolsData = {
	asset: Asset;
	status: PoolStatus;
	priceUSD: BigNumber;
	runeDepth: BigNumber;
	decimal: number;
};
export type PoolsDataMap = Map<string /* asset as string */, PoolsData>;
