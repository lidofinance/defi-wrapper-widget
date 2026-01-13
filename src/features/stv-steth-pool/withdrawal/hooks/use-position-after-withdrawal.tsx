import { useMemo } from 'react';
import invariant from 'tiny-invariant';
import { useWrapperBalance } from '@/modules/defi-wrapper';
import { useVault } from '@/modules/vaults';
import { useDappStatus } from '@/modules/web3';
import { maxBN } from '@/utils/bn';
import { useAvailableMint } from '../../vault-status/mint/use-available-mint';
import { useRepayRebalanceRatio } from './use-repay-rebalance-ratio';

export const usePositionAfterWithdrawal = (
  widthdrawalAmountInEth: bigint | null,
) => {
  const { address } = useDappStatus();
  const { activeVault, queryKeys } = useVault();
  const { assets, isBalanceLoading } = useWrapperBalance();
  const { data: availableMintData } = useAvailableMint();
  const { data: repayRatioData } = useRepayRebalanceRatio(
    widthdrawalAmountInEth || 0n,
    'STETH',
  );

  const data = useMemo(() => {
    if (
      !activeVault ||
      !address ||
      !availableMintData ||
      isBalanceLoading ||
      !repayRatioData
    ) {
      return undefined;
    }

    const { totalMintedSteth } = availableMintData;
    const { repayableSteth, rebalanceableSteth } = repayRatioData;

    // allowing UI to render like user inputed 0 if input is empty
    const vaultBalanceETHAfter = maxBN(
      assets - (widthdrawalAmountInEth || 0n),
      0n,
    );
    const stethMintedAfter = maxBN(
      totalMintedSteth - (repayableSteth + rebalanceableSteth),
      0n,
    );

    return {
      vaultBalanceETHAfter,
      stethMintedAfter,
    };
  }, [
    activeVault,
    address,
    availableMintData,
    isBalanceLoading,
    repayRatioData,
    assets,
    widthdrawalAmountInEth,
  ]);

  return {
    data,
    isLoading:
      isBalanceLoading || availableMintData == null || repayRatioData == null,
  };
};
