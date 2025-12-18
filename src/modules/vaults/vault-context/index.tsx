import {
  FC,
  createContext,
  useContext,
  PropsWithChildren,
  useMemo,
  useEffect,
} from 'react';
import { Address } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useDefiWrapper } from '@/modules/defi-wrapper';
import { useLidoSDK } from '@/modules/web3';

import { useBaseVaultData } from './use-base-vault-data';
import { VaultConfigScopes, vaultQueryKeys } from '../consts';
import type { VaultBaseInfo } from '../types';

type VaultContextType = {
  vaultAddress?: Address;
  activeVault?: VaultBaseInfo;
  queryKeys: ReturnType<typeof vaultQueryKeys>;
  invalidateVaultState: () => Promise<void>;
  invalidateVaultConfig: (scope?: VaultConfigScopes) => Promise<void>;
  invalidateVault: () => Promise<void>;
  error: Error | null;
} & Omit<ReturnType<typeof useBaseVaultData>, 'error'>;

const VaultContext = createContext<VaultContextType | null>(null);
VaultContext.displayName = 'VaultContext';

export const VaultProvider: FC<PropsWithChildren> = ({ children }) => {
  const { publicClient } = useLidoSDK();
  const { stakingVault } = useDefiWrapper();

  const queryClient = useQueryClient();
  const sanitizedVaultAddress = stakingVault?.address ?? undefined;

  const query = useBaseVaultData(sanitizedVaultAddress);

  useEffect(() => {
    if (query.error)
      console.error(
        `[VaultProvider] error fetching ${sanitizedVaultAddress}`,
        query.error,
      );
  }, [query.error, sanitizedVaultAddress]);

  const contextValue = useMemo<VaultContextType>(() => {
    const queryKeys = vaultQueryKeys(
      sanitizedVaultAddress,
      publicClient.chain.id,
      query.data?.hubReport.cid,
    );

    const options = { cancelRefetch: true, throwOnError: false };
    return {
      ...query,
      vaultAddress: sanitizedVaultAddress,
      activeVault: query.data,
      queryKeys,
      error: query.error,
      // refetchQueries refetches all active queries with matching key
      // vs invalidateQueries will trigger eventual refetch but still show data,
      // resulting in old data being shown for a while or passed to sub-queries
      invalidateVaultState: () =>
        queryClient.refetchQueries({ queryKey: queryKeys.stateBase }, options),
      invalidateVaultConfig: (scope?: VaultConfigScopes) =>
        queryClient.refetchQueries(
          { queryKey: queryKeys.config(scope) },
          options,
        ),
      invalidateVault: () =>
        queryClient.refetchQueries({ queryKey: queryKeys.base }, options),
    };
  }, [sanitizedVaultAddress, publicClient.chain.id, query, queryClient]);

  return (
    <VaultContext.Provider value={contextValue}>
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = (): VaultContextType => {
  const context = useContext(VaultContext);
  invariant(context, 'useVault must be used within an VaultProvider');
  return context;
};
