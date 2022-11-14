import type { Node } from '@xchainjs/xchain-thornode';
import type * as O from 'fp-ts/lib/Option';
import type * as RD from '@devexperts/remote-data-ts';
import type BigNumber from 'bignumber.js';
import type { BaseAmount, Address, Asset } from '@xchainjs/xchain-util';
import type { PoolDetails } from '@xchainjs/xchain-midgard';

export type VaultType = 'asgard' | 'ygg' | 'bond';

export type VaultData = {
	asset: Asset;
	address: O.Option<Address>;
	amount: BaseAmount;
	price: O.Option<BaseAmount>;
	type: VaultType;
};

export type VaultDataMap = Map<string /* asset string */, VaultData[]>;
export type BondsDataMap = Map<'THOR.RUNE', VaultData[]>;

export type DataAD = RD.RemoteData<
	Error,
	{ vaults: VaultDataMap; pools: PoolDetails; nodes: Node[] }
>;

export type NodeBondsMap = Map<Address, BaseAmount>;

/**
 * PoolStatus
 * Type is missing in generated types of xchain-midgard
 */
export type PoolStatus = 'available' | 'staged' | 'suspended';
export type PoolsDataMap = Map<
	string /* asset as string */,
	{ status: PoolStatus; price: BigNumber }
>;
