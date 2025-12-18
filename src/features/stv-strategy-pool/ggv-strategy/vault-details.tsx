import React from 'react';
import { DashboardVaultDetails } from '@/shared/wrapper/dashboard';
import { ApyTooltipContent } from './apy-tooltip-content';

export const VaultDetails = () => {
  return (
    <DashboardVaultDetails
      additionalContent={<ApyTooltipContent />}
      showLiquidityFee={true}
      vaultDescription={
        <>
          The vault strategy: ETH is deposited to validators and generate
          staking rewards, stETH is minted and automatically deposited to GGV to
          earn additional rewards. Deposited stETH is distributed across a
          curated set of high-performing DeFi strategies, including lending
          markets (Aave, Fluid) and LP positions (Uniswap v4, Balancer). The
          exact allocation may vary over time based on market conditions and
          strategy performance. All strategies are ETH-correlated to help
          minimize risk from price volatility.
        </>
      }
    />
  );
};
