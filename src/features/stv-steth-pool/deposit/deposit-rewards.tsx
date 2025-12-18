import { useVaultApr } from '@/modules/vaults';

import { RewardEstimation } from '@/shared/wrapper/reward-estimation/reward-estimation';
import { useEstimatedRewards } from './hooks/use-estimated-rewards';

export const DepositApy = () => {
  const { data: vaultApr, isPending: isLoadingAPR } = useVaultApr();
  const {
    estimatedMonthlyRewardsETH,
    estimatedMonthlyRewardsUSD,
    estimatedYearlyRewardsETH,
    estimatedYearlyRewardsUSD,
    isLoadingUSD,
  } = useEstimatedRewards(vaultApr?.aprSma);

  return (
    <RewardEstimation
      aprData={vaultApr}
      isLoadingAPR={isLoadingAPR}
      estimatedMonthlyRewardsETH={estimatedMonthlyRewardsETH ?? 0n}
      estimatedMonthlyRewardsUSD={estimatedMonthlyRewardsUSD}
      estimatedYearlyRewardsETH={estimatedYearlyRewardsETH ?? 0n}
      estimatedYearlyRewardsUSD={estimatedYearlyRewardsUSD}
      isLoadingRewards={isLoadingAPR || isLoadingUSD}
    />
  );
};
