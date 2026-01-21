import { maxUint128 } from 'viem';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useStvSteth } from '@/modules/defi-wrapper';
import {
  useVault,
  readWithReport,
  getLidoV3Contract,
  VAULT_TOTAL_BASIS_POINTS,
} from '@/modules/vaults';
import { useLidoSDK } from '@/modules/web3';
import { maxBN, minBN } from '@/utils/bn';

export const useVaultCapacity = () => {
  const { publicClient, shares } = useLidoSDK();
  const { activeVault, queryKeys } = useVault();
  const { wrapper, dashboard } = useStvSteth();
  return useQuery({
    queryKey: [queryKeys.state, 'vault-capacity'],
    enabled: !!wrapper && !!dashboard,
    queryFn: async () => {
      invariant(dashboard, '[useVaultCapacity] dashboard is required');
      const lidoV3 = getLidoV3Contract(publicClient);

      // estimate maximum minting capacity in stETH shares for vault if a lot of ether is deposited to it
      // bound by vault tier/limits
      const [
        remainingVaultCapacityStethSharesByTier,
        currentVaultLiabilityStethShares,
        currentVaultDepositEth,
      ] = await readWithReport({
        publicClient,
        report: activeVault?.report,
        contracts: [
          dashboard.prepare.remainingMintingCapacityShares([maxUint128]),
          dashboard.prepare.liabilityShares(),
          wrapper.prepare.totalAssets(),
        ],
      });

      // consider Lido's maximum mintable external shares limit bound by it's TVL
      const [
        maxMintableExternalShares,
        currentMintedExternalShares,
        reserveRatioBP,
      ] = await Promise.all([
        lidoV3.read.getMaxMintableExternalShares(),
        lidoV3.read.getExternalShares(),
        wrapper.read.poolReserveRatioBP(),
      ]);

      const reserveRatioPercent =
        (Number(reserveRatioBP) / VAULT_TOTAL_BASIS_POINTS) * 100;

      const remainingLidoExternalSharesCapacity = maxBN(
        0n,
        maxMintableExternalShares - currentMintedExternalShares,
      );

      // real vault remaining minting capacity
      const remainingVaultMintingCapacityStethShares = minBN(
        remainingLidoExternalSharesCapacity,
        remainingVaultCapacityStethSharesByTier,
      );

      const totalVaultMintingCapacityStethShares =
        currentVaultLiabilityStethShares +
        remainingVaultMintingCapacityStethShares;

      // calculate how much ETH we need to achieve max mint
      // this gives us max TVL in practice - more eth deposits will not allow more stETH minting and earning on it
      const [totalDepositCapacityEth] = await readWithReport({
        publicClient,
        report: activeVault?.report,
        contracts: [
          wrapper.prepare.calcAssetsToLockForStethShares([
            totalVaultMintingCapacityStethShares,
          ]),
        ],
      });

      const remainingDepositCapacityEth = maxBN(
        0n,
        totalDepositCapacityEth - currentVaultDepositEth,
      );

      // convert shares to stETH amounts for visibility and usd conversion
      // not used for tx and calculations due to rounding issues
      const [totalMintingCapacitySteth, currentVaultLiabilitySteth] =
        await Promise.all([
          shares.convertToSteth(totalVaultMintingCapacityStethShares),
          shares.convertToSteth(currentVaultLiabilityStethShares),
        ]);

      const remainingMintingCapacitySteth =
        totalMintingCapacitySteth - currentVaultLiabilitySteth;

      return {
        // eth deposits
        currentVaultDepositEth,
        remainingDepositCapacityEth,
        totalDepositCapacityEth,
        // steth minting (shares)
        currentVaultLiabilityStethShares,
        remainingVaultMintingCapacityStethShares,
        totalVaultMintingCapacityStethShares,
        // steth minting (steth)
        currentVaultLiabilitySteth,
        remainingMintingCapacitySteth,
        totalMintingCapacitySteth,
        // RR
        reserveRatioPercent,
        reserveRatioBP,
        reserveRationUnit: reserveRatioPercent / 100,
      };
    },
  });
};
