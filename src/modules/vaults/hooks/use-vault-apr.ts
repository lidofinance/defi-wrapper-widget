import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useLidoSDK } from '@/modules/web3';
import { fetchVaultSMA } from '../api/fetch-sma';
import { useVault } from '../vault-context';

export const useVaultApr = () => {
  const { publicClient } = useLidoSDK();
  const { vaultAddress, queryKeys } = useVault();

  const query = useQuery({
    queryKey: [...queryKeys.base, 'apr'],
    enabled: !!vaultAddress,
    queryFn: async () => {
      invariant(vaultAddress, 'Vault address is required');
      return fetchVaultSMA({ publicClient }, { vaultAddress });
    },
  });

  return {
    ...query,
    isAPRLoading: query.isLoading || query.isPending,
  };
};
