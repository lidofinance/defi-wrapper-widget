import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useEthUsd } from '@/modules/web3';
import { factorMulBN } from '@/utils/bn';
import type { DepositFormValues } from '../deposit-form-context/types';

const MONTHS_IN_YEAR = 12;

export const useEstimatedRewards = (aprPercent?: number) => {
  const amountETH = useWatch<DepositFormValues, 'amount'>({ name: 'amount' });

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
