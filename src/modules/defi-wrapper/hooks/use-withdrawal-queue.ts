import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useVault } from '@/modules/vaults';
import { useDappStatus } from '@/modules/web3';
import { useDefiWrapper } from '../wrapper-provider';

export const useWithdrawalQueue = () => {
  const { activeVault } = useVault();
  const { address } = useDappStatus();
  const { wrapper } = useDefiWrapper();

  const { withdrawalQueue } = useDefiWrapper();

  const balanceQuery = useQuery({
    queryKey: [
      'withdrawalQueue',
      withdrawalQueue?.address,
      'balance',
      { address },
    ],
    enabled: !!address && !!withdrawalQueue && !!wrapper && !!activeVault,
    queryFn: async () => {
      invariant(activeVault, 'activeVault is required');
      invariant(withdrawalQueue, 'withdrawalQueue is required');
      invariant(wrapper, 'wrapper is required');
      invariant(address, 'address is required');

      // NB!: value means ETH -rebalanced wich for stvSteth will need to be accounted for in validation
      const minWithdrawalAmountInEth =
        await withdrawalQueue.read.MIN_WITHDRAWAL_VALUE();

      const maxWithdrawalAmountInEth =
        await withdrawalQueue.read.MAX_WITHDRAWAL_ASSETS();
      return {
        minWithdrawalAmountInEth,
        maxWithdrawalAmountInEth,
      };
    },
  });

  return {
    ...balanceQuery,
    minWithdrawalAmountInEth: balanceQuery.data?.minWithdrawalAmountInEth,
    maxWithdrawalAmountInEth: balanceQuery.data?.maxWithdrawalAmountInEth,
  };
};
