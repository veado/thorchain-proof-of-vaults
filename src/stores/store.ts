import {
	Configuration as ThornodeConfig,
	NodesApi,
	VaultsApi,
	type Node
} from '@xchainjs/xchain-thornode';
import type { Vault } from '@xchainjs/xchain-thornode';
import * as FP from 'fp-ts/lib/function';
import { THORNODE_URL } from './const';
import { derived, writable, type Readable, type Writable } from 'svelte/store';
import * as E from 'fp-ts/lib/Either';
import * as RD from '@devexperts/remote-data-ts';

import * as TE from 'fp-ts/lib/TaskEither';
import { MIDGARD_URL } from './const';

import type { PoolDetails, StatsData } from '@xchainjs/xchain-midgard';
import { Configuration as MidgardConfig, DefaultApi } from '@xchainjs/xchain-midgard';
import { sequenceSTaskEither } from '../utils/fp';
import type { DataAD, PoolsDataMap, VaultList } from '../types/types';
import { getPoolsData, toNodesVaultDataMap, toNodesMap, toVaultList } from '../utils/data';
import { assetAmount } from '@xchainjs/xchain-util';

const midgardConfig = new MidgardConfig({ basePath: MIDGARD_URL });
const midgardApi = new DefaultApi(midgardConfig);

const thornodeConfig = new ThornodeConfig({ basePath: THORNODE_URL });
const vaultsApi = new VaultsApi(thornodeConfig);
const nodesApi = new NodesApi(thornodeConfig);

// All data (incl. loading/error status)
export const dataRD: Writable<DataAD> = writable(RD.pending);
export const vaults: Readable<VaultList> = derived(dataRD, (dataRD) =>
	FP.pipe(
		dataRD,
		RD.map(({ vaults }) => vaults),
		RD.getOrElse(() => [])
	)
);

export const pools: Readable<PoolsDataMap> = derived(dataRD, (dataRD) =>
	FP.pipe(
		dataRD,
		RD.map(({ pools }) => pools),
		RD.getOrElse(() => new Map())
	)
);

const loadAsgards = (): TE.TaskEither<Error, Vault[]> =>
	FP.pipe(
		TE.tryCatch(() => vaultsApi.asgard(), E.toError),
		TE.map(({ data }) => data)
	);

const loadAsgardsJSON = (id: string): TE.TaskEither<Error, Vault[]> =>
	FP.pipe(
		TE.tryCatch(() => import(`../../test/responses/${id}/asgard.json`), E.toError),
		TE.map((result) => result.default as Vault[])
	);

const loadYggs = (): TE.TaskEither<Error, Vault[]> =>
	FP.pipe(
		TE.tryCatch(() => vaultsApi.yggdrasil(), E.toError),
		TE.map(({ data }) => data)
	);

const loadYggsJSON = (id: string): TE.TaskEither<Error, Vault[]> =>
	FP.pipe(
		TE.tryCatch(() => import(`../../test/responses/${id}/yggdrasil.json`), E.toError),
		TE.map((result) => result.default as Vault[])
	);

const loadPools = (): TE.TaskEither<Error, PoolDetails> =>
	FP.pipe(
		TE.tryCatch(() => midgardApi.getPools(), E.toError),
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
		TE.tryCatch(() => nodesApi.nodes(), E.toError),
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
		dataRD.set(RD.pending),
		() =>
			sequenceSTaskEither({
				asgards: loadAsgards(),
				yggs: loadYggs(),
				pools: loadPools(),
				nodes: loadNodes(),
				stats: loadStats()
			}),
		// () =>
		// sequenceSTaskEither({
		// 	asgards: loadAsgardsJSON('churn-8231550'),
		// 	yggs: loadYggsJSON('churn-8231550'),
		// 	pools: loadPoolsJSON('churn-8231550'),
		// 	nodes: loadNodesJSON('churn-8231550'),
		// 	stats: loadStatsJSON('churn-8231550')
		// }),
		(seq) =>
			seq().then(
				E.fold(
					(e) => {
						dataRD.set(RD.failure(e));
					},
					({ asgards, yggs, pools, nodes, stats }) => {
						const poolsDataMap = getPoolsData(pools);

						const vaultList = toVaultList({
							vaults: [...asgards, ...yggs],
							poolsData: poolsDataMap
						});
						const nodesMap = toNodesMap(nodes);
						const _asgardBondVaults = toNodesVaultDataMap({
							vaults: asgards,
							runeUSDPrice: assetAmount(stats.runePriceUSD),
							nodes: nodesMap
						});

						dataRD.set(RD.success({ vaults: vaultList, pools: poolsDataMap, nodes }));
					}
				)
			)
	);
