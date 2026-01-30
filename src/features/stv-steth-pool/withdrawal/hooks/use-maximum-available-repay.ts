import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useStvSteth } from '@/modules/defi-wrapper';
import { useVault } from '@/modules/vaults';
import { useDappStatus, useLidoSDK } from '@/modules/web3';
import { fetchMaximumAvailableRepay } from '../utils/repay-rebalance';

export const useMaximumAvailableRepay = () => {
  const { publicClient } = useLidoSDK();
  const { address } = useDappStatus();
  const { activeVault, queryKeys } = useVault();
  const { shares, wstETH } = useLidoSDK();
  const { wrapper } = useStvSteth();

  const query = useQuery({
    queryKey: ['wrapper', queryKeys.state, 'maximum-repay', { address }],
    enabled: !!wrapper && !!activeVault && !!address,
    queryFn: async () => {
      invariant(
        activeVault,
        '[useMaximumAvailableRepay] activeVault is required',
      );
      invariant(address, '[useMaximumAvailableRepay] address is required');

      return fetchMaximumAvailableRepay({
        publicClient,
        report: activeVault.report,
        wrapper,
        address,
        shares,
        wstETH,
      });
    },
  });

  return {
    ...query,
    maxEthForRepayableSteth: query.data?.maxEthForRepayableSteth,
    maxEthForRepayableWSteth: query.data?.maxEthForRepayableWSteth,
  };
};
