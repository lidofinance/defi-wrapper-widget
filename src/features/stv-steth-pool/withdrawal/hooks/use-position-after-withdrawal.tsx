import { useMemo } from 'react';
import {
  useWrapperBalance,
  useRepayRebalanceRatio,
} from '@/modules/defi-wrapper';
import { useVault } from '@/modules/vaults';
import { useDappStatus } from '@/modules/web3';
import { maxBN } from '@/utils/bn';
import { useAvailableMint } from '../../vault-status/mint/use-available-mint';

export const usePositionAfterWithdrawal = (
  widthdrawalAmountInEth: bigint | null,
) => {
  const { address } = useDappStatus();
  const { activeVault } = useVault();
  const { assets, isBalanceLoading } = useWrapperBalance();
  const { data: availableMintData } = useAvailableMint();
  const { rebalanceRatio } = useRepayRebalanceRatio(
    widthdrawalAmountInEth || 0n,
    'STETH',
  );

  const data = useMemo(() => {
    if (
      !activeVault ||
      !address ||
      !availableMintData ||
      isBalanceLoading ||
      !rebalanceRatio ||
      typeof assets !== 'bigint'
    ) {
      return undefined;
    }

    const { totalMintedSteth } = availableMintData;
    const { repayableSteth, rebalancableSteth } = rebalanceRatio;

    // allowing UI to render like user inputed 0 if input is empty
    const vaultBalanceETHAfter = maxBN(
      assets - (widthdrawalAmountInEth || 0n),
      0n,
    );
    const stethMintedAfter = maxBN(
      totalMintedSteth - (repayableSteth + rebalancableSteth),
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
    rebalanceRatio,
    assets,
    widthdrawalAmountInEth,
  ]);

  return {
    data,
    isLoading: isBalanceLoading || !availableMintData || !rebalanceRatio,
  };
};
