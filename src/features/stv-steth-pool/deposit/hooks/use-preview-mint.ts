import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { useWatch } from 'react-hook-form';
import invariant from 'tiny-invariant';
import { useStvSteth } from '@/modules/defi-wrapper';
import {
  readWithReport,
  useVault,
  VAULT_TOTAL_BASIS_POINTS,
} from '@/modules/vaults';
import { useDappStatus, useLidoSDK } from '@/modules/web3';

import { factorMulBN, isEqualEpsilonBN, minBN } from '@/utils/bn';

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
        reserveRatioBP,
      ] = await Promise.all([
        shares.convertToSteth(remainingUserMintingCapacityShares),
        shares.convertToSteth(remainingVaultMintingCapacityShares),
        wrapper.read.poolReserveRatioBP(),
      ]);

      const reserveRatioPercent =
        (Number(reserveRatioBP) / VAULT_TOTAL_BASIS_POINTS) * 100;

      const maxToMintShares = minBN(
        remainingUserMintingCapacityShares,
        remainingVaultMintingCapacityShares,
      );
      const maxToMintSteth = minBN(
        remainingUserMintingCapacitySteth,
        remainingVaultMintingCapacitySteth,
      );

      const expectedMintedSteth = factorMulBN(
        amount,
        1 - reserveRatioPercent / 100,
      );

      const expectedMintedStethShares =
        await shares.convertToShares(expectedMintedSteth);

      return {
        maxToMintShares,
        remainingUserMintingCapacityShares,
        remainingVaultMintingCapacityShares,

        maxToMintSteth,
        remainingUserMintingCapacitySteth,
        remainingVaultMintingCapacitySteth,

        expectedMintedSteth,
        expectedMintedStethShares,
        reserveRatioPercent,
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
