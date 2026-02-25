import {
  DashboardBalanceApy,
  DashboardContainer,
} from '@/shared/wrapper/dashboard';
import { ApyTooltipContent } from '../apy-tooltip-content';
import { useEarnPosition, useEarnStrategyApy } from '../hooks';
import { VaultDetails } from '../vault-details';
import { VaultStatus } from '../vault-status';

export const Dashboard = () => {
  const { apySmaCurrent, isLoadingApr, updatedAt } = useEarnStrategyApy();
  const {
    isPositionLoading,
    positionData,
    totalUserValueInUsd,
    isUsdAmountLoading,
  } = useEarnPosition();

  const aprData =
    updatedAt && apySmaCurrent
      ? {
          updatedAt,
          apySma: apySmaCurrent,
        }
      : undefined;

  return (
    <DashboardContainer>
      <DashboardBalanceApy
        token={'ETH'}
        balance={positionData?.totalUserValueInEth}
        isBalanceLoading={isPositionLoading}
        isUSDAmountLoading={isUsdAmountLoading}
        usdAmount={totalUserValueInUsd}
        isAPYLoading={isLoadingApr}
        aprData={aprData}
        customAPYTooltipContent={<ApyTooltipContent />}
      />
      <VaultStatus showBoost showRewards={true} />
      <VaultDetails />
    </DashboardContainer>
  );
};
