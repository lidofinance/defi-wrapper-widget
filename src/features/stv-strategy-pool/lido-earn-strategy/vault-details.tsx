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
      vaultDescription={
        <>
          The vault strategy: ETH is deposited to validators and generates
          staking rewards, stETH is minted and automatically deposited to the
          Earn ETH strategy to earn additional rewards. Deposited stETH is
          distributed across a curated set of high-performing DeFi strategies,
          including lending markets (Aave, Fluid) and LP positions (Uniswap v4,
          Balancer). The exact allocation may vary over time based on market
          conditions and strategy performance. All strategies are ETH-correlated
          to help minimize risk from price volatility
        </>
      }
      customAPY={apySma}
      customAPYIsLoading={isLoadingApr}
    />
  );
};
