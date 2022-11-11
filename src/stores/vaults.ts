import { Configuration, VaultsApi } from '@xchainjs/xchain-thornode';
import * as AD from '../utils/async';
import * as FP from 'fp-ts/lib/function';
import * as Rx from 'rxjs';
import * as RxOp from 'rxjs/operators';
import { triggerStream } from '../utils/rx';
import { THORNODE_URL } from './const';

const config = new Configuration({ basePath: THORNODE_URL });
const api = new VaultsApi(config);

const { stream$: reloadAsgards$, trigger: reloadAsgards } = triggerStream();
export { reloadAsgards };

export const asgardsAD$ = FP.pipe(
	reloadAsgards$,
	RxOp.switchMap(() =>
		// inner stream to provide loading state
		FP.pipe(
			Rx.from(api.asgard()),
			RxOp.map(({ data }) => data),
			RxOp.map(AD.success),
			RxOp.catchError((error) =>
				Rx.of(AD.error(Error(`Failed to get asgard vaults from ${THORNODE_URL} ${error}`)))
			),
			RxOp.startWith(AD.pending)
		)
	),
	RxOp.shareReplay(1)
);

export const asgardsNo$ = FP.pipe(
	asgardsAD$,
	RxOp.map(AD.map((r) => r.length)),
	RxOp.startWith(AD.pending)
);
