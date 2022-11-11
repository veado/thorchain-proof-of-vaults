// Note: All content of this file is copied from https://github.com/veado/asgardex-stats/blob/main/src/utils/async.ts

import * as O from 'fp-ts/lib/Option';
import * as E from 'fp-ts/lib/Either';
import * as ET from 'fp-ts/lib/EitherT';
import * as FP from 'fp-ts/lib/function';

/**
 * `AsyncData` provides three states of `async` data
 *
 * (1) pending (by default - there is no initial state)
 * (2) error
 * (3) success
 */

export type AsyncData<E, A> = O.Option<E.Either<E, A>>;

export const map: <A, B>(f: (a: A) => B) => <E>(fa: AsyncData<E, A>) => AsyncData<E, B> = ET.map(
	O.Monad
);

export const matchE: <E, A, B>(
	onLeft: (e: E) => O.Option<B>,
	onRight: (a: A) => O.Option<B>
) => (ma: AsyncData<E, A>) => O.Option<B> = ET.matchE(O.Monad);

/** alias of matchE */
export const fold = matchE;

export const getOrElse: <E, A>(
	onLeft: (e: E) => O.Option<A>
) => (ma: AsyncData<E, A>) => O.Option<A> = ET.getOrElse(O.Monad);

export const pending: AsyncData<never, never> = O.none;
export const success: <A>(v: A) => AsyncData<never, A> = (v) => O.some(E.right(v));
export const error: <E>(e: E) => AsyncData<E, never> = (e) => O.some(E.left(e));

export const isPending: <E, A>(ma: AsyncData<E, A>) => boolean = O.isNone;
export const isError: <E, A>(ma: AsyncData<E, A>) => boolean = FP.flow(
	fold(
		() => O.some(true),
		() => O.some(false)
	),
	O.getOrElse(() => false)
);
export const isSuccess: <E, A>(ma: AsyncData<E, A>) => boolean = FP.flow(
	getOrElse(() => O.none),
	O.isSome
);

export const fromEither: <E, A>(e: E.Either<E, A>) => AsyncData<E, A> = O.some;
export const fromOption: <E, A>(onNone: () => E) => (o: O.Option<A>) => AsyncData<E, A> =
	(onNone) => (o) =>
		FP.pipe(o, E.fromOption(onNone), O.some);
export const toOption: <E, A>(ma: AsyncData<E, A>) => O.Option<A> = getOrElse(() => O.none);

/**
 * Fold all states
 */
export const foldA: <E, A, T>(
	onPending: () => T,
	onError: (e: E) => T,
	onSuccess: (a: A) => T
) => (ma: AsyncData<E, A>) => T = (onPending, onError, onSuccess) => (ma) =>
	FP.pipe(ma, O.fold(onPending, E.fold(onError, onSuccess)));
