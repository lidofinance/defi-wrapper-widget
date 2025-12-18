import { useMaximumAvailableRepay } from './use-maximum-available-repay';
import { useRepayRebalanceRatio } from './use-repay-rebalance-ratio';
import type { RepayTokens } from '../withdrawal-form-context/types';

export const useRepayRebalanceAmount = (
  amount: bigint | null,
  repayToken: RepayTokens,
) => {
  const { maxEthForRepayableWSteth, maxEthForRepayableSteth } =
    useMaximumAvailableRepay();

  const { data, isPending, isLoading } = useRepayRebalanceRatio(
    amount,
    repayToken,
  );
  const isLoadingAll = isPending || isLoading;

  if (repayToken === 'WSTETH') {
    return {
      maxEthForRepayableToken: maxEthForRepayableWSteth,
      repayable: data?.repayableStethShares,
      rebalanceable: data?.rebalanceableStethShares,
      isLoading: isLoadingAll,
    };
  }

  return {
    maxEthForRepayableToken: maxEthForRepayableSteth,
    repayable: data?.repayableSteth,
    rebalanceable: data?.rebalanceableSteth,
    isLoading: isLoadingAll,
  };
};
