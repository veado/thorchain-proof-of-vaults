import { sequenceS, sequenceT } from 'fp-ts/lib/Apply';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import * as S from 'fp-ts/lib/string';
import * as N from 'fp-ts/lib/number';
import * as Ord from 'fp-ts/lib/Ord';
import type * as Eq from 'fp-ts/lib/Eq';

import type BigNumber from 'bignumber.js';
import { assetAmount, baseAmount, type AssetAmount, type BaseAmount } from '@xchainjs/xchain-util';
import type { Monoid } from 'fp-ts/lib/Monoid';
import type { VaultData, VaultListData } from 'src/types/types';

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

const eqAssetAmount: Eq.Eq<AssetAmount> = {
	equals: (x, y) => eqBigNumber.equals(x.amount(), y.amount()) && x.decimal === y.decimal
};

export const ordAssetAmount: Ord.Ord<AssetAmount> = {
	equals: eqAssetAmount.equals,
	compare: (x, y) => ordBigNumber.compare(x.amount(), y.amount())
};

const ordOptionAssetAmount = O.getOrd(ordAssetAmount);

export const ordVaultByUSDAmount: Ord.Ord<VaultListData> = Ord.contramap(
	(x: VaultListData) => x.totalUSD
)(ordOptionAssetAmount);

export const ordVaultByUSDAmountReverse: Ord.Ord<VaultListData> = Ord.reverse(ordVaultByUSDAmount);

export const ordVaultByName: Ord.Ord<VaultListData> = Ord.contramap(
	(x: VaultListData) => x.asset.ticker
)(S.Ord);

export const ordVaultByNameReverse: Ord.Ord<VaultListData> = Ord.reverse(ordVaultByName);

const getOrdVaultDataValueByTypeStatus = ({ type, status }: VaultData): number => {
	switch (type) {
		case 'unknown':
			return 0;
		case 'bond':
			if (status === 'Active') return 1;
			if (status === 'Standby') return 2;
			return 0;
		case 'ygg':
			if (status === 'Standby') return 3;
			if (status === 'Active') return 4;
			return 0;
		case 'asgard':
			if (status === 'RetiringVault') return 5;
			if (status === 'ActiveVault') return 6;
			return 0;
	}
};

export const ordVaultDataByTypeStatus: Ord.Ord<VaultData> = Ord.fromCompare((x, y) =>
	N.Ord.compare(getOrdVaultDataValueByTypeStatus(x), getOrdVaultDataValueByTypeStatus(y))
);
export const ordVaultDataByTypeStatusReverse: Ord.Ord<VaultData> =
	Ord.reverse(ordVaultDataByTypeStatus);
