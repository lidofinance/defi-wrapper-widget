import { useMaximumAvailableRepay } from './use-maximum-available-repay';
import { useRepayRebalanceRatio } from './use-repay-rebalance-ratio';
import { getRepayRebalanceAmountFromData } from '../utils/repay-rebalance';
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

  return {
    ...getRepayRebalanceAmountFromData({
      repayToken,
      repayRatioData: data,
      maxEthForRepayableSteth,
      maxEthForRepayableWSteth,
    }),
    isLoading: isLoadingAll,
  };
};
