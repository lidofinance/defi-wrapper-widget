import { useMemo } from 'react';
import { useEthUsd } from '@/modules/web3';
import { factorMulBN } from '@/utils/bn';

const MONTHS_IN_YEAR = 12;

export const useEstimatedRewards = (
  aprPercent?: number,
  amountETH?: bigint | null,
) => {
  const { estimatedMonthlyRewardsETH, estimatedYearlyRewardsETH } =
    useMemo(() => {
      if (typeof amountETH !== 'bigint' || typeof aprPercent != 'number')
        return {
          estimatedYearlyRewardsETH: null,
          estimatedMonthlyRewardsETH: null,
        };

      const estimatedYearlyRewardsETH = factorMulBN(
        amountETH,
        aprPercent / 100,
      );
      const estimatedMonthlyRewardsETH = factorMulBN(
        amountETH,
        aprPercent / MONTHS_IN_YEAR / 100,
      );

      return {
        estimatedYearlyRewardsETH,
        estimatedMonthlyRewardsETH,
      };
    }, [amountETH, aprPercent]);

  const { usdAmount: estimatedYearlyRewardsUSD, isLoading: isLoadingUSD } =
    useEthUsd(estimatedYearlyRewardsETH ?? 0n);
  const { usdAmount: estimatedMonthlyRewardsUSD } = useEthUsd(
    estimatedMonthlyRewardsETH ?? 0n,
  );
  return {
    estimatedMonthlyRewardsETH,
    estimatedMonthlyRewardsUSD,
    estimatedYearlyRewardsETH,
    estimatedYearlyRewardsUSD,
    isLoadingUSD,
  };
};
