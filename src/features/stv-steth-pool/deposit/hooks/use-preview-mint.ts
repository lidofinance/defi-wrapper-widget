import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { useWatch } from 'react-hook-form';
import invariant from 'tiny-invariant';
import { useStvSteth } from '@/modules/defi-wrapper';
import { readWithReport, useVault } from '@/modules/vaults';
import { useDappStatus, useLidoSDK } from '@/modules/web3';

import { clampZeroBN, isEqualEpsilonBN, minBN } from '@/utils/bn';

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
  const { shares, core } = useLidoSDK();
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

      const lidoV3 = await core.getLidoContract();

      const [
        remainingUserMintingCapacityShares,
        remainingVaultMintingCapacityShares,
        expectedMintedStethShares,
        userAssets,
        userMintedShares,
        maxMintableExternalShares,
        currentMintedExternalShares,
      ] = await readWithReport({
        publicClient,
        report: activeVault?.report,
        contracts: [
          wrapper.prepare.remainingMintingCapacitySharesOf([address, amount]),
          dashboard.prepare.remainingMintingCapacityShares([amount]),
          wrapper.prepare.calcStethSharesToMintForAssets([amount]),
          wrapper.prepare.assetsOf([address]),
          wrapper.prepare.mintedStethSharesOf([address]),
          // not dependant on report but benefit from batch
          lidoV3.prepare.getMaxMintableExternalShares(),
          lidoV3.prepare.getExternalShares(),
        ],
      });

      const remainingLidoCapacityShares = clampZeroBN(
        maxMintableExternalShares - currentMintedExternalShares,
      );

      const [actualUserLiability] = await readWithReport({
        publicClient,
        report: activeVault?.report,
        contracts: [
          wrapper.prepare.calcStethSharesToMintForAssets([userAssets]),
        ],
      });

      // how much of capacity of the user is taken by existing liability
      const takenMintingCapacity = clampZeroBN(
        userMintedShares - actualUserLiability,
      );

      const maxToMintShares = minBN(
        remainingUserMintingCapacityShares,
        remainingVaultMintingCapacityShares,
        remainingLidoCapacityShares,
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
