import { DashboardVaultDetails } from '@/shared/wrapper/dashboard';
import { ApyTooltipContent } from './apy-tooltip-content';
import { useEarnStrategyApy } from './hooks';

export const VaultDetails = () => {
  const { apySma, isLoadingApr } = useEarnStrategyApy();
  return (
    <DashboardVaultDetails
      showMaxTVL={true}
      additionalContent={<ApyTooltipContent />}
      showLiquidityFee={true}
      vaultDescription={<>TODO</>}
      customAPY={apySma}
      customAPYIsLoading={isLoadingApr}
    />
  );
};
