import { sequenceS, sequenceT } from 'fp-ts/lib/Apply';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import * as S from 'fp-ts/lib/string';
import * as Ord from 'fp-ts/lib/Ord';
import type * as Eq from 'fp-ts/lib/Eq';

import type BigNumber from 'bignumber.js';
import { assetAmount, baseAmount, type AssetAmount, type BaseAmount } from '@xchainjs/xchain-util';
import type { Monoid } from 'fp-ts/lib/Monoid';
import type { VaultListData } from 'src/types/types';

export const sequenceSTaskEither = sequenceS(TE.ApplicativePar);
export const sequenceSOption = sequenceS(O.Applicative);
export const sequenceTOption = sequenceT(O.Apply);

export const monoidBaseAmount: Monoid<BaseAmount> = {
	concat: (x, y) => x.plus(y),
	empty: baseAmount(0)
};

export const monoidAssetAmount: Monoid<AssetAmount> = {
	concat: (x, y) => x.plus(y),
	empty: assetAmount(0)
};

const eqBigNumber: Eq.Eq<BigNumber> = {
	equals: (x, y) => x.isEqualTo(y)
};

const ordBigNumber: Ord.Ord<BigNumber> = {
	equals: eqBigNumber.equals,
	compare: (x, y) => (y.isLessThan(x) ? -1 : y.isGreaterThan(x) ? 1 : 0)
};

// const eqBaseAmount: Eq.Eq<BaseAmount> = {
// 	equals: (x, y) => eqBigNumber.equals(x.amount(), y.amount()) && x.decimal === y.decimal
// };

// const eqOptionBaseAmount = O.getEq(eqBaseAmount)

// export const ordBaseAmount: Ord.Ord<BaseAmount> = {
// 	equals: eqBaseAmount.equals,
// 	compare: (x, y) => ordBigNumber.compare(x.amount(), y.amount())
// };

const eqAssetAmount: Eq.Eq<AssetAmount> = {
	equals: (x, y) => eqBigNumber.equals(x.amount(), y.amount()) && x.decimal === y.decimal
};

export const ordAssetAmount: Ord.Ord<AssetAmount> = {
	equals: eqAssetAmount.equals,
	compare: (x, y) => ordBigNumber.compare(x.amount(), y.amount())
};

const ordOptionAssetAmount = O.getOrd(ordAssetAmount);

// const ordVaultByUSDAmount: Ord.Ord<VaultListData> = Ord.fromCompare((x, y) =>
// 	ordOptionAssetAmount.compare(x.totalUSD, y.totalUSD)
// );

export const ordVaultByUSDAmount: Ord.Ord<VaultListData> = Ord.contramap(
	(x: VaultListData) => x.totalUSD
)(ordOptionAssetAmount);

export const ordVaultByUSDAmountReverse: Ord.Ord<VaultListData> = Ord.reverse(ordVaultByUSDAmount);

export const ordVaultByName: Ord.Ord<VaultListData> = Ord.contramap(
	(x: VaultListData) => x.asset.ticker
)(S.Ord);

export const ordVaultByNameReverse: Ord.Ord<VaultListData> = Ord.reverse(ordVaultByName);
