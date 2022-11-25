import type * as TN from '@xchainjs/xchain-thornode';
import type * as O from 'fp-ts/lib/Option';
import type * as RD from '@devexperts/remote-data-ts';
import type BigNumber from 'bignumber.js';
import type { BaseAmount, Address, Asset, AssetAmount } from '@xchainjs/xchain-util';

export type VaultType = 'asgard' | 'ygg' | 'node' | 'unknown';
export type VaultStatus =
	| 'RetiringVault'
	| 'ActiveVault'
	| TN.NodeStatusEnum
	| 'Active'
	| 'Standby'
	| 'unknown';
/**
 * Tweaks THORNodes API `Vault` type by using valid properties only
 */
export type Vault = Pick<TN.Vault, 'addresses' | 'coins'> & {
	id: string;
	type: VaultType;
	status: VaultStatus;
	members: string[];
};

/** VaultMember is always a Node */
export type VaultMember = Address;
export type VaultMembers = VaultMember[];

/** VaultMembership of a Node for a Vautl (Asgard or Yggdrasil) */
export type VaultMembership = { vaultId: string; type: VaultType };
export type VaultMemberships = VaultMembership[];

export type VaultData = {
	id: string;
	asset: Asset;
	address: O.Option<Address>;
	amount: BaseAmount;
	amountUSD: O.Option<AssetAmount>;
	type: VaultType;
	status: VaultStatus;
	members: VaultMembers;
	memberships: VaultMemberships;
};

export type VaultListData = {
	asset: Asset;
	total: BaseAmount;
	assetPriceUSD: O.Option<BigNumber>;
	totalUSD: O.Option<AssetAmount>;
	data: VaultData[];
};

export type VaultList = VaultListData[];

export type VaultSort = 'usd' | 'usdRev' | 'name' | 'nameRev';

export type DataAD = RD.RemoteData<Error, { vaults: VaultList; pools: PoolsDataMap }>;

export type NodesData = {
	bondAmount: BaseAmount;
	nodeStatus: TN.NodeStatusEnum;
	nodeAddress: Address;
	pubKeySecp256k1: string;
};
export type NodesDataMap = Map<Address, NodesData>;

/**
 * PoolStatus
 * Type is missing in generated types of xchain-midgard
 */
export type PoolStatus = 'available' | 'staged' | 'suspended' | 'unknown';
export type PoolsData = {
	asset: Asset;
	status: PoolStatus;
	assetPriceUSD: BigNumber;
	runeDepth: BigNumber;
	decimal: number;
};

export type PoolsDataMap = Map<string /* asset as string */, PoolsData>;

/**
 * Visible status of VaultDetails
 * O.some('expanded') -> all vaults expand its details
 * O.some('collapsed') -> all vaults collapse its details
 * O.none -> misc. -> collapsed or expanded depending on user interactions
 * */
export type VaultDetailsStatus = O.Option<'collapsed' | 'expanded'>;
