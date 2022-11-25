import type { PoolStatus, VaultSort, VaultStatus, VaultType } from 'src/types/types';

export const labelByPoolStatus = (status: PoolStatus) => {
	switch (status) {
		case 'available':
			return 'active';
		case 'staged':
			return 'pending';
		case 'suspended':
			return 'inactive';
		case 'unknown':
			return 'no';
	}
};

export const labelByVaultStatus = (status: VaultStatus) => {
	switch (status) {
		case 'ActiveVault':
		case 'Active':
			return 'active';
		case 'RetiringVault':
			return 'retiring';
		case 'Standby':
			return 'standby';
		case 'unknown':
			return 'unkown';
	}
};

export const bgColorByVaultStatus = (status: VaultStatus) => {
	switch (status) {
		case 'ActiveVault':
		case 'Active':
			return 'bg-tc';
		case 'RetiringVault':
			return 'bg-orange-500';
		case 'Standby':
			return 'bg-yellow-500';
		case 'unknown':
			return 'bg-gray-500';
	}
};

export const labelByVaultType = (type: VaultType) => {
	switch (type) {
		case 'asgard':
			return 'asgard';
		case 'ygg':
			return 'Yggdrasil';
		case 'node':
			return 'node';
		case 'unknown':
			return 'unknown';
	}
};

export const VAULT_SORT_LABEL_MAP: Record<VaultSort, string /* label*/> = {
	usd: 'USD ↓',
	usdRev: 'USD ↑',
	name: 'Asset ↓',
	nameRev: 'Asset ↑'
};

export const plural = (word: string, n: number) => (n > 1 ? `${word}s` : word);
