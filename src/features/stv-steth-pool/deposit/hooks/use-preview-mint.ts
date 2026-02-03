import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { useWatch } from 'react-hook-form';
import invariant from 'tiny-invariant';
import { useStvSteth } from '@/modules/defi-wrapper';
import { readWithReport, useVault, getLidoV3Contract } from '@/modules/vaults';
import { useDappStatus, useLidoSDK } from '@/modules/web3';

import { isEqualEpsilonBN, maxBN, minBN } from '@/utils/bn';

import { DepositFormValues } from '../deposit-form-context/types';

export const usePreviewMint = () => {
  const amount = useWatch<DepositFormValues, 'amount'>({
    name: 'amount',
  });
  const tokenToMint = useWatch<DepositFormValues, 'tokenToMint'>({
    name: 'tokenToMint',
  });
  const { address } = useDappStatus();
  const publicClient = usePublicClient();
  const { wrapper, mintingPaused, dashboard } = useStvSteth();
  const { shares } = useLidoSDK();
  const { queryKeys, activeVault } = useVault();

  const query = useQuery({
    queryKey: [
      queryKeys.state,
      'preview-mint',
      { amount: amount?.toString(), address },
    ],
    enabled: typeof amount === 'bigint' && !!address && !!dashboard,
    queryFn: async () => {
      invariant(address, '[usePreviewMint] address is undefined');
      invariant(
        typeof amount === 'bigint',
        '[usePreviewMint] amount is not bigint',
      );
      invariant(dashboard, '[usePreviewMint] dashboard is undefined');

      if (mintingPaused) {
        return {
          maxToMintShares: 0n,
          remainingUserMintingCapacityShares: 0n,
          remainingVaultMintingCapacityShares: 0n,

          maxToMintSteth: 0n,
          remainingUserMintingCapacitySteth: 0n,
          remainingVaultMintingCapacitySteth: 0n,

          expectedMintedSteth: 0n,
          expectedMintedStethShares: 0n,
          reserveRatioPercent: 0,
        };
      }

      const lidoV3 = getLidoV3Contract(publicClient);

      const [
        remainingUserMintingCapacityShares,
        remainingVaultMintingCapacityShares,
        expectedMintedStethShares,
        userAssets,
        userMintedShares,
      ] = await readWithReport({
        publicClient,
        report: activeVault?.report,
        contracts: [
          wrapper.prepare.remainingMintingCapacitySharesOf([address, amount]),
          dashboard.prepare.remainingMintingCapacityShares([amount]),
          wrapper.prepare.calcStethSharesToMintForAssets([amount]),
          wrapper.prepare.assetsOf([address]),
          wrapper.prepare.mintedStethSharesOf([address]),
        ],
      });

      const [maxMintableExternalShares, currentMintedExternalShares] =
        await Promise.all([
          lidoV3.read.getMaxMintableExternalShares(),
          lidoV3.read.getExternalShares(),
        ]);

      const remainingLidoCapacityShares = maxBN(
        maxMintableExternalShares - currentMintedExternalShares,
        0n,
      );

      const [actualUserLiability] = await readWithReport({
        publicClient,
        report: activeVault?.report,
        contracts: [
          wrapper.prepare.calcStethSharesToMintForAssets([userAssets]),
        ],
      });

      // how much of capacity of the user is taken by existing liability
      const takenMintingCapacity = maxBN(
        userMintedShares - actualUserLiability,
        0n,
      );

      const maxToMintShares = minBN(
        remainingUserMintingCapacityShares,
        minBN(remainingVaultMintingCapacityShares, remainingLidoCapacityShares),
      );

      const isLimitedByVaultCapacity =
        remainingUserMintingCapacityShares >=
        minBN(remainingVaultMintingCapacityShares, remainingLidoCapacityShares);

      const isLimitedByLiability = takenMintingCapacity > 0n;

      const maxToMintSteth = await shares.convertToSteth(maxToMintShares);
      const expectedMintedSteth = await shares.convertToSteth(
        expectedMintedStethShares,
      );

      return {
        maxToMintShares,
        remainingUserMintingCapacityShares,
        remainingVaultMintingCapacityShares,
        isLimitedByVaultCapacity,
        isLimitedByLiability,

        maxToMintSteth,

        expectedMintedSteth,
        expectedMintedStethShares,
      };
    },
  });

  const maxMint =
    (tokenToMint === 'STETH'
      ? query.data?.maxToMintSteth
      : query.data?.maxToMintShares) ?? 0n;
  const expectedMint =
    (tokenToMint === 'STETH'
      ? query.data?.expectedMintedSteth
      : query.data?.expectedMintedStethShares) ?? 0n;

  const shouldShowWarning = !isEqualEpsilonBN(maxMint, expectedMint);

  const mintingSpread = maxMint - expectedMint;

  return {
    ...query,
    shouldShowWarning,
    maxMint,
    expectedMint,
    mintingSpread,
  };
};
