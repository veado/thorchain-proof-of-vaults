import { sequenceS } from 'fp-ts/lib/Apply';
import * as TE from 'fp-ts/lib/TaskEither';

export const sequenceSTaskEither = sequenceS(TE.ApplicativePar);
