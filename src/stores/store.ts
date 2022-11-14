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

import type { PoolDetails } from '@xchainjs/xchain-midgard';
import { Configuration as MidgardConfig, DefaultApi } from '@xchainjs/xchain-midgard';
import { sequenceSTaskEither } from '../utils/fp';
import type { DataAD, VaultData, VaultDataMap } from '../types/types';
import { getNodeBonds, getPoolsData, toBondsMap, toVaultDataMap } from '../utils/data';

const midgardConfig = new MidgardConfig({ basePath: MIDGARD_URL });
const midgardApi = new DefaultApi(midgardConfig);

const thornodeConfig = new ThornodeConfig({ basePath: THORNODE_URL });
const vaultsApi = new VaultsApi(thornodeConfig);
const nodesApi = new NodesApi(thornodeConfig);

// All data (incl. loading/error status)
export const dataRD: Writable<DataAD> = writable(RD.pending);
export const vaults: Readable<Array<{ id: string; vaults: VaultData[] }>> = derived(
	dataRD,
	(dataRD) =>
		FP.pipe(
			dataRD,
			RD.map(({ vaults }) => Array.from(vaults, ([id, vaults]) => ({ id, vaults }))),
			RD.map((v) => v),
			RD.getOrElse(() => [])
		)
);

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
		dataRD.set(RD.pending),
		// load all data in sequence (similar to Promise.all)
		() => sequenceSTaskEither({ asgards: loadAsgards(), pools: loadPools(), nodes: loadNodes() }),
		(seq) =>
			seq().then(
				E.fold(
					(e) => {
						dataRD.set(RD.failure(e));
					},
					({ asgards, pools, nodes }) => {
						const poolsData = getPoolsData(pools);
						const asgardVaults = toVaultDataMap({ vaults: asgards, poolsData, type: 'asgard' });
						const bonds = getNodeBonds(nodes);
						const asgardBondVaults = toBondsMap({ vaults: asgards, poolsData, bonds });
						const asgardVaultMap: VaultDataMap = new Map([...asgardVaults, ...asgardBondVaults]);

						dataRD.set(RD.success({ vaults: asgardVaultMap, pools, nodes }));
					}
				)
			)
	);
