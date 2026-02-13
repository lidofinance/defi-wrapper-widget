import { useEstimatedRewards } from '@/modules/defi-wrapper';

import { useWatch } from 'react-hook-form';

import { RewardEstimation } from '@/shared/wrapper/reward-estimation/reward-estimation';

import type { DepositFormValues } from './deposit-form-context/types';
import { ApyTooltipContent } from '../apy-tooltip-content';

export const DepositApy = () => {
  // const { apySma, isLoadingApr, updatedAt } = useGGVStrategyApy();

  const amountETH = useWatch<DepositFormValues, 'amount'>({ name: 'amount' });
  const {
    estimatedMonthlyRewardsETH,
    estimatedMonthlyRewardsUSD,
    estimatedYearlyRewardsETH,
    estimatedYearlyRewardsUSD,
    isLoadingUSD,
  } = useEstimatedRewards(undefined);

  // const aprData =
  //   apySma && updatedAt
  //     ? {
  //         updatedAt,
  //         apySma: apySma,
  //       }
  //     : undefined;

  return (
    <RewardEstimation
      aprData={undefined}
      isLoadingAPR={false}
      estimatedMonthlyRewardsETH={estimatedMonthlyRewardsETH ?? 0n}
      estimatedMonthlyRewardsUSD={estimatedMonthlyRewardsUSD}
      estimatedYearlyRewardsETH={estimatedYearlyRewardsETH ?? 0n}
      estimatedYearlyRewardsUSD={estimatedYearlyRewardsUSD}
      isLoadingRewards={isLoadingUSD}
      customAPYTooltipContent={<ApyTooltipContent />}
    />
  );
};
