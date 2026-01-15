import React from 'react';
import { FormatPercent } from '@/shared/formatters';
import { DashboardVaultDetails } from '@/shared/wrapper/dashboard';
import { useMintingLimits } from '@/modules/defi-wrapper';

export const VaultDetails = () => {
  const { data: mintData } = useMintingLimits();
  return (
    <DashboardVaultDetails
      showMaxTVL={true}
      showLiquidityFee={true}
      vaultDescription={
        <>
          The vault strategy: ETH is deposited on validators and generate
          staking rewards. stETH is automatically minted on depositing and
          repaid on withdrawal according to the Reserve Ratio{' '}
          <FormatPercent
            decimals="percent"
            value={mintData?.reserveRatioPercent}
          />
          .
        </>
      }
    />
  );
};
