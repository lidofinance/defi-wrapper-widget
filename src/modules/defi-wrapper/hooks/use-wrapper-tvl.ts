import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useVault, readWithReport } from '@/modules/vaults';
import { useEthUsd, useLidoSDK } from '@/modules/web3';
import { useDefiWrapper } from '../wrapper-provider';

export const useWrapperTvl = () => {
  const { publicClient } = useLidoSDK();
  const { wrapper } = useDefiWrapper();
  const { activeVault, queryKeys } = useVault();

  const tvlQuery = useQuery({
    queryKey: [queryKeys.state, 'wrapper', 'tvl'],
    enabled: !!wrapper,
    queryFn: async () => {
      invariant(wrapper, 'wrapper is required');
      const [totalAssets] = await readWithReport({
        publicClient,
        report: activeVault?.report,
        contracts: [wrapper.prepare.totalAssets()] as const,
      });

      return totalAssets;
    },
  });

  const usdQuery = useEthUsd(tvlQuery.data);

  return {
    ...tvlQuery,
    isLoading: tvlQuery.isLoading || usdQuery.isLoading,
    tvlETH: tvlQuery.data,
    tvlUSD: usdQuery.usdAmount,
    usdQuery,
  };
};
