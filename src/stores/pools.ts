import { Configuration, DefaultApi } from '@xchainjs/xchain-midgard';
import * as AD from '../utils/async';
import * as FP from 'fp-ts/lib/function';
import * as Rx from 'rxjs';
import * as RxOp from 'rxjs/operators';
import { triggerStream } from '../utils/rx';
import { MIDGARD_URL } from './const';

const config = new Configuration({ basePath: MIDGARD_URL });
const api = new DefaultApi(config);

const { stream$: reloadPools$, trigger: reloadPools } = triggerStream();
export { reloadPools };

export const poolsAD$ = FP.pipe(
	reloadPools$,
	RxOp.switchMap(() =>
		// inner stream to provide loading state
		FP.pipe(
			Rx.from(api.getPools()),
			RxOp.map(({ data }) => data),
			RxOp.map(AD.success),
			RxOp.catchError((error) =>
				Rx.of(AD.error(Error(`Failed to get pools from ${MIDGARD_URL} ${error}`)))
			),
			RxOp.startWith(AD.pending)
		)
	),
	RxOp.shareReplay(1)
);
