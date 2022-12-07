import {
	Configuration as ThornodeConfig,
	NodesApi,
	VaultsApi,
	type Node
} from '@xchainjs/xchain-thornode';
import type { Vault } from '@xchainjs/xchain-thornode';
import * as FP from 'fp-ts/lib/function';
import { APP_IDENTIFIER, MAX_REALOAD_COUNTER, THORNODE_URL } from './const';
import { derived, get, writable, type Readable, type Writable } from 'svelte/store';
import * as E from 'fp-ts/lib/Either';
import * as RD from '@devexperts/remote-data-ts';
import * as A from 'fp-ts/lib/Array';

import * as TE from 'fp-ts/lib/TaskEither';
import { MIDGARD_URL } from './const';

import type { PoolDetails, StatsData } from '@xchainjs/xchain-midgard';
import { Configuration as MidgardConfig, DefaultApi } from '@xchainjs/xchain-midgard';
import {
	ordVaultByName,
	ordVaultByNameReverse,
	ordVaultByUSDAmount,
	ordVaultByUSDAmountReverse,
	sequenceSTaskEither
} from '../utils/fp';
import type { DataAD, PoolsDataMap, VaultList, VaultListData, VaultSort } from '../types/types';
import {
	toPoolsDataMap,
	toNodesDataMap,
	toVaultList,
	toReadable,
	toNodesVaultList,
	toVaults,
	getNoVaultsFromVaultList
} from '../utils/data';
import type * as Ord from 'fp-ts/lib/Ord';
import { assetToString, bnOrZero } from '@xchainjs/xchain-util';
import axios from 'axios';

axios.interceptors.request.use(
	(config) => {
		try {
			// Creating an URL will throw an `TypeError` if `url` is not available and 'unknown-url' is set
			// [TypeError: Invalid URL] input: 'unknown-url', code: 'ERR_INVALID_URL' }
			const url = new URL(config?.url ?? 'unknown-url');
			if (url.host.includes('ninerealms')) {
				// headers can be undefined/empty in `AxiosRequestConfig`
				if (!config.headers) config.headers = {};
				config.headers['x-client-id'] = `${APP_IDENTIFIER}`;
			}
		} catch (error) {
			console.error(`Failed to add custom 'x-client-id' header`, error);
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

const midgardConfig = new MidgardConfig({ basePath: MIDGARD_URL });
const midgardApi = new DefaultApi(midgardConfig);

const thornodeConfig = new ThornodeConfig({ basePath: THORNODE_URL });
const vaultsApi = new VaultsApi(thornodeConfig);
const nodesApi = new NodesApi(thornodeConfig);

const dataRD$$: Writable<DataAD> = writable(RD.pending);
export const dataRD$: Readable<DataAD> = toReadable(dataRD$$);

const _vaults = writable<VaultList>([]);
export const vaults$: Readable<VaultList> = derived(dataRD$, (dataRD) =>
	FP.pipe(
		dataRD,
		RD.map(({ vaults }) => {
			_vaults.set(vaults);
			return vaults;
		}),
		RD.getOrElse(() => get(_vaults))
	)
);

export const noTotalAsgards$: Readable<number> = derived(vaults$, (vaults) =>
	getNoVaultsFromVaultList({ type: 'asgard', list: vaults })
);

export const noActiveAsgards$: Readable<number> = derived(vaults$, (vaults) =>
	getNoVaultsFromVaultList({ type: 'asgard', list: vaults, status: 'ActiveVault' })
);

export const noRetiringAsgards$: Readable<number> = derived(vaults$, (vaults) =>
	getNoVaultsFromVaultList({ type: 'asgard', list: vaults, status: 'RetiringVault' })
);

export const noTotalYggs$: Readable<number> = derived(vaults$, (vaults) =>
	getNoVaultsFromVaultList({ type: 'ygg', list: vaults })
);

const VAULT_SORT_MAP: Record<VaultSort, Ord.Ord<VaultListData>> = {
	usd: ordVaultByUSDAmount,
	usdRev: ordVaultByUSDAmountReverse,
	name: ordVaultByName,
	nameRev: ordVaultByNameReverse
};

export const vaultSort$$ = writable<VaultSort>('usd');
export const vaultSearch$$ = writable<string>('');

export const vaultsSorted$: Readable<VaultList> = derived(
	[vaultSort$$, vaults$, vaultSearch$$],
	([vaultSort, vaults, search]) =>
		FP.pipe(
			vaults,
			A.sort(VAULT_SORT_MAP[vaultSort]),
			A.filter(({ asset }) => {
				if (!search) return true;
				return assetToString(asset).toLowerCase().includes(search);
			})
		)
);

const _pools = writable<PoolsDataMap>(new Map());
export const pools$: Readable<PoolsDataMap> = derived(dataRD$, (dataRD) =>
	FP.pipe(
		dataRD,
		RD.map(({ pools }) => {
			_pools.set(pools);
			return pools;
		}),
		RD.getOrElse(() => get(_pools))
	)
);

export const autoReload$$ = writable(true);

let _counter = 0;

const counter$: Readable<number> = derived(
	[autoReload$$, dataRD$],
	([autoReload, dataRD], set: (v: number) => void) => {
		let intervalId: NodeJS.Timer | undefined;
		const reset = () => {
			intervalId && clearInterval(intervalId);
			_counter = 0;
			set(_counter);
		};
		if (autoReload && !RD.isPending(dataRD)) {
			reset();
			intervalId = setInterval(() => {
				_counter++;
				set(_counter);
			}, 1000);
		} else {
			reset();
		}

		return reset;
	}
);

counter$.subscribe((value) => {
	if (value >= MAX_REALOAD_COUNTER) {
		loadAllData();
	}
});

export const timeLeft$: Readable<number> = derived(
	counter$,
	(counter) => MAX_REALOAD_COUNTER - counter
);

const loadAsgards = (): TE.TaskEither<Error, Vault[]> =>
	FP.pipe(
		TE.tryCatch(() => vaultsApi.asgard(undefined /* height */), E.toError),
		TE.map(({ data }) => data)
	);

const loadAsgardsJSON = (id: string): TE.TaskEither<Error, Vault[]> =>
	FP.pipe(
		TE.tryCatch(() => import(`../../test/responses/${id}/asgard.json`), E.toError),
		TE.map((result) => result.default as Vault[])
	);

const loadYggs = (): TE.TaskEither<Error, Vault[]> =>
	FP.pipe(
		TE.tryCatch(() => vaultsApi.yggdrasil(undefined /* height */), E.toError),
		TE.map(({ data }) => data)
	);

const loadYggsJSON = (id: string): TE.TaskEither<Error, Vault[]> =>
	FP.pipe(
		TE.tryCatch(() => import(`../../test/responses/${id}/yggdrasil.json`), E.toError),
		TE.map((result) => result.default as Vault[])
	);

const loadPools = (): TE.TaskEither<Error, PoolDetails> =>
	FP.pipe(
		TE.tryCatch(
			() => midgardApi.getPools(undefined /* status */, undefined /* period */),
			E.toError
		),
		TE.map(({ data }) => data)
	);

const loadPoolsJSON = (id: string): TE.TaskEither<Error, PoolDetails> =>
	FP.pipe(
		TE.tryCatch(() => import(`../../test/responses/${id}/pools.json`), E.toError),
		TE.map((result) => result.default)
	);

const loadStats = (): TE.TaskEither<Error, StatsData> =>
	FP.pipe(
		TE.tryCatch(() => midgardApi.getStats(), E.toError),
		TE.map(({ data }) => data)
	);

const loadStatsJSON = (id: string): TE.TaskEither<Error, StatsData> =>
	FP.pipe(
		TE.tryCatch(() => import(`../../test/responses/${id}/stats.json`), E.toError),
		TE.map((result) => result.default)
	);

const loadNodes = (): TE.TaskEither<Error, Node[]> =>
	FP.pipe(
		TE.tryCatch(() => nodesApi.nodes(undefined /* height */), E.toError),
		TE.map(({ data }) => data)
	);

const loadNodesJSON = (id: string): TE.TaskEither<Error, Node[]> =>
	FP.pipe(
		TE.tryCatch(() => import(`../../test/responses/${id}/nodes.json`), E.toError),
		TE.map((result) => result.default as Node[])
	);

const _1 = [loadAsgards, loadYggs, loadPools, loadNodes, loadStats];
const _2 = [loadAsgardsJSON, loadYggsJSON, loadPoolsJSON, loadNodesJSON, loadStatsJSON];

export const loadAllData = async () =>
	FP.pipe(
		// pending
		dataRD$$.set(RD.pending),
		() =>
			sequenceSTaskEither({
				asgards: loadAsgards(),
				yggs: loadYggs(),
				pools: loadPools(),
				nodes: loadNodes(),
				stats: loadStats()
			}),
		// () =>
		// 	sequenceSTaskEither({
		// 		asgards: loadAsgardsJSON('churn-8231550'),
		// 		yggs: loadYggsJSON('churn-8231550'),
		// 		pools: loadPoolsJSON('churn-8231550'),
		// 		nodes: loadNodesJSON('churn-8231550'),
		// 		stats: loadStatsJSON('churn-8231550')
		// 	}),
		// () =>
		// 	sequenceSTaskEither({
		// 		asgards: loadAsgardsJSON('8295828'),
		// 		yggs: loadYggsJSON('8295828'),
		// 		pools: loadPoolsJSON('8295828'),
		// 		nodes: loadNodesJSON('8295828'),
		// 		stats: loadStatsJSON('8295828')
		// 	}),
		(seq) =>
			seq().then(
				E.fold(
					(e) => {
						dataRD$$.set(RD.failure(e));
					},
					({ asgards, yggs, pools, nodes, stats }) => {
						const poolsDataMap = toPoolsDataMap(pools);

						const asgardYggsVaults = toVaults([...asgards, ...yggs]);

						const nodesDataMap = toNodesDataMap(nodes);

						const asgardYggsList = toVaultList({
							vaults: asgardYggsVaults,
							poolsData: poolsDataMap,
							nodesData: nodesDataMap
						});

						const runeUSDPrice = bnOrZero(stats.runePriceUSD);

						const nodeVaultList = toNodesVaultList({
							vaults: asgardYggsVaults,
							nodesData: nodesDataMap,
							runeUSDPrice
						});

						const vaults = [...asgardYggsList, ...nodeVaultList];

						dataRD$$.set(RD.success({ vaults, pools: poolsDataMap }));
					}
				)
			)
	);
