import {
	Configuration as ThornodeConfig,
	NodesApi,
	NodeStatusEnum,
	VaultsApi,
	type Node
} from '@xchainjs/xchain-thornode';
import type { Vault } from '@xchainjs/xchain-thornode';
import * as FP from 'fp-ts/lib/function';
import { THORNODE_URL } from './const';
import { writable, type Writable } from 'svelte/store';
import * as E from 'fp-ts/lib/Either';
import * as A from 'fp-ts/lib/Array';
import * as RD from '@devexperts/remote-data-ts';

import * as TE from 'fp-ts/lib/TaskEither';
import { MIDGARD_URL } from './const';

import type { PoolDetails } from '@xchainjs/xchain-midgard';
import { Configuration as MidgardConfig, DefaultApi } from '@xchainjs/xchain-midgard';
import { sequenceSTaskEither } from '../utils/fp';

const midgardConfig = new MidgardConfig({ basePath: MIDGARD_URL });
const midgardApi = new DefaultApi(midgardConfig);

const thornodeConfig = new ThornodeConfig({ basePath: THORNODE_URL });
const vaultsApi = new VaultsApi(thornodeConfig);
const nodesApi = new NodesApi(thornodeConfig);

// All data (incl. loading/error status)
export type DataAD = RD.RemoteData<Error, { vaults: Vault[]; pools: PoolDetails; nodes: Node[] }>;
export type DataStore = Writable<DataAD>;
export const data: DataStore = writable(RD.pending);

const loadAsgards = (): TE.TaskEither<Error, Vault[]> =>
	FP.pipe(
		TE.tryCatch(() => vaultsApi.asgard(), E.toError),
		TE.map(({ data }) => data)
	);

const loadPools = (): TE.TaskEither<Error, PoolDetails> =>
	FP.pipe(
		TE.tryCatch(() => midgardApi.getPools(), E.toError),
		TE.map(({ data }) => data)
	);

const loadNodes = (): TE.TaskEither<Error, Node[]> =>
	FP.pipe(
		TE.tryCatch(() => nodesApi.nodes(), E.toError),
		TE.map(({ data }) => data)
	);

export const loadAllData = async () =>
	FP.pipe(
		// pending
		data.set(RD.pending),
		// load all data in sequence (similar to Promise.all)
		() => sequenceSTaskEither({ asgards: loadAsgards(), pools: loadPools(), nodes: loadNodes() }),
		(seq) =>
			seq().then(
				E.fold(
					// check errors
					(e) => {
						data.set(RD.failure(e));
					},
					// handle data
					({ asgards, pools, nodes }) => {
						const activeNodes = FP.pipe(
							nodes,
							A.filter((node) => node.status === NodeStatusEnum.Active)
						);
						data.set(RD.success({ vaults: asgards, pools, nodes: activeNodes }));
					}
				)
			)
	);
