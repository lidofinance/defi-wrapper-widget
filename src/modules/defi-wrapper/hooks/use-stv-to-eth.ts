import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useConvert } from '@/modules/defi-wrapper';
import { useVault } from '@/modules/vaults';

export const useStvToEth = (amount: bigint) => {
  const { convertFromStvToEth } = useConvert();
  const { queryKeys } = useVault();
  const publicClient = usePublicClient();
  const { activeVault } = useVault();
  const convertQuery = useQuery({
    queryKey: [...queryKeys.state, 'useStvToEth', amount.toString()],
    enabled: !!activeVault,
    queryFn: async () => {
      invariant(activeVault, 'activeVault is required');
      return convertFromStvToEth(publicClient, activeVault.report, amount);
    },
  });

  return {
    ...convertQuery,
    amountInEth: convertQuery.data,
  };
};
