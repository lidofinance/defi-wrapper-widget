import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useVault } from '@/modules/vaults';
import { useDappStatus } from '@/modules/web3';
import { useDefiWrapper } from '../wrapper-provider';

export const useWalletWhitelisted = () => {
  const { address } = useDappStatus();
  const { wrapper, configuration, strategy } = useDefiWrapper();
  const { queryKeys } = useVault();

  const query = useQuery({
    queryKey: [
      queryKeys.config(),
      'wrapper',
      'whitelist',
      {
        address,
        isWhitelistEnabled: configuration?.isWhitelistEnabled,
        isStrategy: !!strategy,
      },
    ],
    enabled: !!wrapper && !!address && configuration !== undefined,
    queryFn: async () => {
      invariant(wrapper, 'wrapper is required');
      invariant(address, 'address is required');
      invariant(configuration, 'configuration is required');

      if (!configuration.isWhitelistEnabled) {
        return true;
      }

      const contract = strategy ? strategy : wrapper;

      return await contract.read.isAllowListed([address]);
    },
  });

  return {
    ...query,
    isLoading: query.isLoading || query.isPending,
    isWalletWhitelisted: query.data,
  };
};
