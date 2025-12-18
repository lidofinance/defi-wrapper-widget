import {
  DashboardBalanceApy,
  DashboardContainer,
} from '@/shared/wrapper/dashboard';
import { ApyTooltipContent } from '../apy-tooltip-content';
import { useGGVStrategyApy } from '../hooks/use-ggv-strategy-apy';
import { useGGVStrategyPosition } from '../hooks/use-ggv-strategy-position';
import { VaultDetails } from '../vault-details';
import { VaultStatus } from '../vault-status';

export const Dashboard = () => {
  const { apySmaCurrent, isLoadingApr, updatedAt } = useGGVStrategyApy();
  const { usdAmount, totalValueInEth, isBalanceLoading, isUSDLoading } =
    useGGVStrategyPosition();

  const aprData =
    updatedAt && apySmaCurrent
      ? {
          updatedAt,
          aprSma: apySmaCurrent,
        }
      : undefined;

  return (
    <DashboardContainer>
      <DashboardBalanceApy
        isBalanceLoading={isBalanceLoading}
        isUSDAmountLoading={isUSDLoading}
        token={'ETH'}
        balance={totalValueInEth}
        usdAmount={usdAmount}
        isAPYLoading={isLoadingApr}
        aprData={aprData}
        customAPYTooltipContent={<ApyTooltipContent />}
      />
      <VaultStatus showBoost showRewards={true} />
      <VaultDetails />
    </DashboardContainer>
  );
};
