import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useConvert } from '@/modules/defi-wrapper';
import { useVault } from '@/modules/vaults';

export const useEthToStv = (amount: bigint) => {
  const { convertFromEthToStv } = useConvert();
  const { queryKeys } = useVault();
  const publicClient = usePublicClient();
  const { activeVault } = useVault();
  const convertQuery = useQuery({
    queryKey: [...queryKeys.state, 'useEthToStv', amount],
    enabled: !!activeVault,
    queryFn: async () => {
      invariant(activeVault, 'activeVault is required');
      return convertFromEthToStv(publicClient, activeVault.report, amount);
    },
  });

  return {
    ...convertQuery,
    amountInStv: convertQuery.data,
  };
};
