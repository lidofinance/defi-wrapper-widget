import { maxUint120 } from 'viem';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useStvSteth } from '@/modules/defi-wrapper';
import { useVault, readWithReport } from '@/modules/vaults';
import { useLidoSDK } from '@/modules/web3';
import { maxBN } from '@/utils/bn';

export const useVaultCapacity = () => {
  const { publicClient, shares } = useLidoSDK();
  const { activeVault, queryKeys } = useVault();
  const { wrapper, dashboard } = useStvSteth();
  return useQuery({
    queryKey: ['wrapper', queryKeys.state, 'vault-capacity'],
    enabled: !!wrapper && !!activeVault,
    queryFn: async () => {
      invariant(dashboard, '[useVaultCapacity] dashboard is required');
      invariant(activeVault, '[useVaultCapacity] activeVault is required');

      const [totalMintingCapacityStethShares] = await readWithReport({
        publicClient,
        report: activeVault.report,
        contracts: [
          activeVault.hub.prepare.totalMintingCapacityShares([
            activeVault.vault.address,
            maxUint120,
          ]),
        ],
      });

      const [
        totalDepositCapacityEth,
        totalAssetsEth,
        totalLiabilityStethShares,
      ] = await readWithReport({
        publicClient,
        report: activeVault.report,
        contracts: [
          wrapper.prepare.calcAssetsToLockForStethShares([
            totalMintingCapacityStethShares,
          ]),
          wrapper.prepare.totalAssets(),
          wrapper.prepare.totalLiabilityShares(),
        ],
      });

      const [totalMintingCapacitySteth, totalLiabilitySteth] =
        await Promise.all([
          shares.convertToSteth(totalMintingCapacityStethShares),
          shares.convertToSteth(totalLiabilityStethShares),
        ]);

      return {
        totalMintingCapacityStethShares,
        totalDepositCapacityEth,
        totalAssetsEth,
        remainingDepositCapacityEth: maxBN(
          totalDepositCapacityEth - totalAssetsEth,
          0n,
        ),
        remainingMintingCapacityStethShares: maxBN(
          totalMintingCapacityStethShares - totalLiabilityStethShares,
          0n,
        ),
        totalLiabilityStethShares,
        totalMintingCapacitySteth,
        totalLiabilitySteth,
      };
    },
  });
};
