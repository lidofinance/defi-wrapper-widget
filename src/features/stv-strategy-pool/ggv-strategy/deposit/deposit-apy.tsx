import { RewardEstimation } from '@/shared/wrapper/reward-estimation/reward-estimation';
import { ApyTooltipContent } from '../apy-tooltip-content';
import { useGGVStrategyApy } from '../hooks/use-ggv-strategy-apy';
import { useEstimatedRewards } from './hooks/use-estimated-rewards';

export const DepositApy = () => {
  const { apySma, isLoadingApr, updatedAt } = useGGVStrategyApy();
  const {
    estimatedMonthlyRewardsETH,
    estimatedMonthlyRewardsUSD,
    estimatedYearlyRewardsETH,
    estimatedYearlyRewardsUSD,
    isLoadingUSD,
  } = useEstimatedRewards(apySma);

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
