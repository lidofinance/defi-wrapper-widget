import { useMemo } from 'react';
import { useRepayRebalanceRatio } from '@/modules/defi-wrapper';
import { useMaximumAvailableRepay } from './use-maximum-available-repay';
import type { RepayTokens } from '../withdrawal-form-context/types';

export const useRepayRebalanceAmount = (
  amount: bigint | null,
  repayToken: RepayTokens,
) => {
  const { maxEthForRepayableWSteth, maxEthForRepayableSteth } =
    useMaximumAvailableRepay();

  const { rebalanceRatio, isPending, isLoading } = useRepayRebalanceRatio(
    amount,
    repayToken,
  );
  const isLoadingAll = isPending || isLoading;

  const result = useMemo(() => {
    if (repayToken === 'WSTETH')
      return {
        maxEthForRepayableToken: maxEthForRepayableWSteth,
        repayable: rebalanceRatio?.repayableStethShares,
        rebalanceable: rebalanceRatio?.rebalancableStethShares,
      };

    return {
      maxEthForRepayableToken: maxEthForRepayableSteth,
      repayable: rebalanceRatio?.repayableSteth,
      rebalanceable: rebalanceRatio?.rebalancableSteth,
    };
  }, [
    repayToken,
    rebalanceRatio,
    maxEthForRepayableSteth,
    maxEthForRepayableWSteth,
  ]);

  return {
    isLoading: isLoadingAll,
    ...result,
  };
};
