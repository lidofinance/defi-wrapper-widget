import { useWatch } from 'react-hook-form';
import { useEstimatedRewards } from '@/modules/defi-wrapper';
import { useVaultApr } from '@/modules/vaults';

import { RewardEstimation } from '@/shared/wrapper/reward-estimation/reward-estimation';

import type { DepositFormValues } from './deposit-form-context/types';

export const DepositApy = () => {
  const { data: vaultApr, isPending: isLoadingAPR } = useVaultApr();
  const amountETH = useWatch<DepositFormValues, 'amount'>({ name: 'amount' });
  const {
    estimatedMonthlyRewardsETH,
    estimatedMonthlyRewardsUSD,
    estimatedYearlyRewardsETH,
    estimatedYearlyRewardsUSD,
    isLoadingUSD,
  } = useEstimatedRewards(vaultApr?.aprSma, amountETH);

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
