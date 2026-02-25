import { useWatch } from 'react-hook-form';
import { useEstimatedRewards } from '@/modules/defi-wrapper';
import { RewardEstimation } from '@/shared/wrapper/reward-estimation/reward-estimation';
import { ApyTooltipContent } from '../apy-tooltip-content';
import { useGGVStrategyApy } from '../hooks/use-ggv-strategy-apy';

import type { DepositFormValues } from './deposit-form-context/types';

export const DepositApy = () => {
  const { apySma, isLoadingApr, updatedAt } = useGGVStrategyApy();
  const amountETH = useWatch<DepositFormValues, 'amount'>({ name: 'amount' });
  const {
    estimatedMonthlyRewardsETH,
    estimatedMonthlyRewardsUSD,
    estimatedYearlyRewardsETH,
    estimatedYearlyRewardsUSD,
    isLoadingUSD,
  } = useEstimatedRewards(apySma, amountETH);

  const aprData =
    apySma && updatedAt
      ? {
          updatedAt,
          apySma: apySma,
        }
      : undefined;

  return (
    <RewardEstimation
      aprData={aprData}
      isLoadingAPR={isLoadingApr}
      estimatedMonthlyRewardsETH={estimatedMonthlyRewardsETH ?? 0n}
      estimatedMonthlyRewardsUSD={estimatedMonthlyRewardsUSD}
      estimatedYearlyRewardsETH={estimatedYearlyRewardsETH ?? 0n}
      estimatedYearlyRewardsUSD={estimatedYearlyRewardsUSD}
      isLoadingRewards={isLoadingApr || isLoadingUSD}
      customAPYTooltipContent={<ApyTooltipContent />}
    />
  );
};
