import React from 'react';
import { DashboardVaultDetails } from '@/shared/wrapper/dashboard';

export const VaultDetails = () => {
  return (
    <DashboardVaultDetails
      showLiquidityFee={false}
      vaultDescription={
        <>
          The vault strategy: ETH is deposited on validators and generate
          staking rewards.
        </>
      }
    />
  );
};
