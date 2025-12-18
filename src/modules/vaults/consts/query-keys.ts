import type { Address } from 'viem';

export type VaultConfigScopes = 'roles' | 'settings';

export const vaultQueryKeys = (
  vaultAddress: Address = '0x<none-address>',
  chainId = 0,
  ipfsCID = '<none-cid>',
) => {
  // this key scopes all query about specific vault on chain
  const base = ['wrapper', 'vault', vaultAddress, chainId] as const;

  // this key scopes all queries about vault state that changes with actions or reports
  // e.g. mint, burn, report, etc.
  const stateBase = [...base, 'state'] as const;
  const state = [...stateBase, ipfsCID] as const;

  // this key scopes all queries about vault configuration that is not dependant on state
  // but can be changed by other setters
  // e.g. roles, fees, confirmations
  const config = [...base, 'config'] as const;

  return {
    base,
    stateBase,
    state,
    config: (scope?: VaultConfigScopes) =>
      [...config, ...(scope ? [scope] : [])] as const,
  } as const;
};

export const vaultListQueryKeys = (
  chainId = 0,
  owner: Address = '0x<none-address>',
) => {
  const vaultsListBase = ['vaults-list', chainId] as const;
  return {
    vaultsListBase,
    myVaults: [...vaultsListBase, 'my-vaults', owner] as const,
    AllVaults: [...vaultsListBase, 'all-vaults'] as const,
  } as const;
};
