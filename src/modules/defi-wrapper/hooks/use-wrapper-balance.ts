import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { readWithReport, useVault } from '@/modules/vaults';
import { useDappStatus, useEthUsd, useLidoSDK } from '@/modules/web3';
import { useDefiWrapper } from '../wrapper-provider';

export const useWrapperBalance = () => {
  const { publicClient } = useLidoSDK();
  const { activeVault } = useVault();
  const { address } = useDappStatus();
  const { wrapper } = useDefiWrapper();

  const balanceQuery = useQuery({
    queryKey: ['wrapper', wrapper?.address, 'balance', { address }],
    enabled: !!address && !!wrapper && !!activeVault,
    queryFn: async () => {
      invariant(activeVault, 'activeVault is required');
      invariant(wrapper, 'wrapper is required');
      invariant(address, 'address is required');

      const [assets, shares] = await readWithReport({
        publicClient,
        report: activeVault.report,
        contracts: [
          wrapper.prepare.assetsOf([address]),
          wrapper.prepare.balanceOf([address]),
        ] as const,
      });

      return {
        shares,
        assets,
      };
    },
  });

  const { usdAmount, ...usdQuery } = useEthUsd(balanceQuery.data?.assets);

  return {
    ...balanceQuery,
    usdQuery,
    isUSDLoading: usdQuery.isLoading || usdQuery.isPending,
    isBalanceLoading: balanceQuery.isLoading || balanceQuery.isPending,
    shares: balanceQuery.data?.shares,
    assets: balanceQuery.data?.assets,
    usdAmount,
  };
};
