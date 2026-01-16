import { maxUint128 } from 'viem';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useVault, readWithReport, getLidoV3Contract } from '@/modules/vaults';
import { useEthUsd, useLidoSDK } from '@/modules/web3';
import { minBN } from '@/utils/bn';
import { useStvSteth } from '../wrapper-provider';

export const useMaxWrapperTvl = () => {
  const { publicClient } = useLidoSDK();
  const { wrapper, dashboard } = useStvSteth();
  const { activeVault, queryKeys } = useVault();

  const tvlQuery = useQuery({
    queryKey: [queryKeys.state, 'max-tvl'],
    enabled: !!wrapper,
    queryFn: async () => {
      invariant(wrapper, 'wrapper is required');
      invariant(dashboard, 'dashboard is required');
      const [remainingSharesToMint, currentSharesMinted] = await readWithReport(
        {
          publicClient,
          report: activeVault?.report,
          contracts: [
            dashboard.prepare.remainingMintingCapacityShares([maxUint128]),
            dashboard.prepare.liabilityShares(),
          ] as const,
        },
      );

      const lidoV3 = getLidoV3Contract(publicClient);

      const maxMintableExternalShares =
        await lidoV3.read.getMaxMintableExternalShares();

      const maxVaultShares = minBN(
        currentSharesMinted + remainingSharesToMint,
        maxMintableExternalShares,
      );

      const [maxEtherLocked] = await readWithReport({
        publicClient,
        report: activeVault?.report,
        contracts: [
          wrapper.prepare.calcAssetsToLockForStethShares([maxVaultShares]),
        ] as const,
      });

      return {
        maxEtherLocked,
        maxVaultShares,
      };
    },
  });

  const usdQuery = useEthUsd(tvlQuery.data?.maxEtherLocked);

  return {
    ...tvlQuery,
    isLoading: tvlQuery.isLoading || usdQuery.isLoading,
    maxTvlETH: tvlQuery.data?.maxEtherLocked,
    maxTvlUSD: usdQuery.usdAmount,
    usdQuery,
  };
};
