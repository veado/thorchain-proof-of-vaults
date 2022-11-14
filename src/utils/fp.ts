import { sequenceS, sequenceT } from 'fp-ts/lib/Apply';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { baseAmount, type BaseAmount } from '@xchainjs/xchain-util';
import type { Monoid } from 'fp-ts/lib/Monoid';

export const sequenceSTaskEither = sequenceS(TE.ApplicativePar);
export const sequenceSOption = sequenceS(O.Applicative);
export const sequenceTOption = sequenceT(O.Apply);

export const monoidBaseAmount: Monoid<BaseAmount> = {
	concat: (x, y) => x.plus(y),
	empty: baseAmount(0)
};
