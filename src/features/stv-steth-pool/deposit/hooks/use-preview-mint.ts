import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { useWatch } from 'react-hook-form';
import invariant from 'tiny-invariant';
import { useStvSteth } from '@/modules/defi-wrapper';
import { readWithReport, useVault } from '@/modules/vaults';
import { useDappStatus, useLidoSDK } from '@/modules/web3';

import { factorMulBN, isEqualEpsilonBN, minBN } from '@/utils/bn';

import { useMintingLimits } from './use-minting-limits';
import { DepositFormValues } from '../deposit-form-context/types';

export const usePreviewMint = () => {
  const amount = useWatch<DepositFormValues, 'amount'>({
    name: 'amount',
  });
  const { address } = useDappStatus();
  const publicClient = usePublicClient();
  const { wrapper, dashboard } = useStvSteth();
  const { shares } = useLidoSDK();
  const { queryKeys, activeVault } = useVault();

  const { data: mintingLimits } = useMintingLimits();

  const query = useQuery({
    queryKey: [
      queryKeys.state,
      'preview-mint',
      { amount: amount?.toString(), address },
    ],
    enabled:
      typeof amount === 'bigint' && !!address && !!wrapper && !!dashboard,
    queryFn: async () => {
      invariant(address, '[usePreviewMint] address is undefined');
      invariant(
        typeof amount === 'bigint',
        '[usePreviewMint] amount is not bigint',
      );
      invariant(dashboard, '[usePreviewMint] dashboard is undefined');
      const [
        remainingUserMintingCapacityShares,
        remainingVaultMintingCapacityShares,
      ] = await readWithReport({
        publicClient,
        report: activeVault?.report,
        contracts: [
          wrapper.prepare.remainingMintingCapacitySharesOf([address, amount]),
          dashboard.prepare.remainingMintingCapacityShares([amount]),
        ],
      });

      const [
        remainingUserMintingCapacitySteth,
        remainingVaultMintingCapacitySteth,
      ] = await Promise.all([
        shares.convertToSteth(remainingUserMintingCapacityShares),
        shares.convertToSteth(remainingVaultMintingCapacityShares),
      ]);

      const maxToMintShares = minBN(
        remainingUserMintingCapacityShares,
        remainingVaultMintingCapacityShares,
      );
      const maxToMintSteth = minBN(
        remainingUserMintingCapacitySteth,
        remainingVaultMintingCapacitySteth,
      );

      return {
        maxToMintShares,
        remainingUserMintingCapacityShares,
        remainingVaultMintingCapacityShares,

        maxToMintSteth,
        remainingUserMintingCapacitySteth,
        remainingVaultMintingCapacitySteth,
      };
    },
  });

  const expectedMintedAmount =
    mintingLimits &&
    amount &&
    factorMulBN(amount, 1 - mintingLimits.reserveRatioPercent / 100);

  const shouldShowWarning =
    query.data?.maxToMintSteth !== undefined &&
    expectedMintedAmount &&
    !isEqualEpsilonBN(expectedMintedAmount, query.data?.maxToMintSteth);

  const mintingSpread =
    expectedMintedAmount && query.data?.maxToMintSteth !== undefined
      ? query.data.maxToMintSteth - expectedMintedAmount
      : 0n;

  const wrapperdMintingSpread =
    amount && mintingLimits && query.data?.maxToMintShares !== undefined
      ? query.data.maxToMintShares -
        factorMulBN(amount, 1 - mintingLimits.reserveRatioPercent / 100)
      : 0n;

  return {
    ...query,
    shouldShowWarning,
    expectedMintedAmount,
    mintingSpread,
    wrappedMintingSpread: wrapperdMintingSpread,
  };
};
