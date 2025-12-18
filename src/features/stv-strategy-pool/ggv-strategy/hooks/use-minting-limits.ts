import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useStvStrategy } from '@/modules/defi-wrapper';
import {
  readWithReport,
  useVault,
  VAULT_TOTAL_BASIS_POINTS,
} from '@/modules/vaults';

export const useMintingLimits = () => {
  const publicClient = usePublicClient();
  const { wrapper, dashboard } = useStvStrategy();
  const { queryKeys, activeVault } = useVault();

  return useQuery({
    queryKey: [...queryKeys.state, 'minting-limits'],
    enabled: !!dashboard,
    queryFn: async () => {
      invariant(dashboard, '[useMintingLimits] dashboard is undefined');
      const [reserveRatioBP, remainingStethShares, totalMintedStethShares] =
        await readWithReport({
          publicClient,
          report: activeVault?.report,
          contracts: [
            wrapper.prepare.reserveRatioBP(),
            dashboard.prepare.remainingMintingCapacityShares([0n]),
            wrapper.prepare.totalMintedStethShares(),
          ],
        });

      const reserveRatioPercent =
        (Number(reserveRatioBP) / VAULT_TOTAL_BASIS_POINTS) * 100;

      return {
        reserveRatioPercent,
        remainingStethShares,
        totalMintedStethShares,
      };
    },
  });
};
