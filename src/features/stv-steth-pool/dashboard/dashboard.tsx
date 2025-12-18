import { useWrapperBalance } from '@/modules/defi-wrapper';
import { useVaultApr } from '@/modules/vaults';
import {
  DashboardBalanceApy,
  DashboardContainer,
} from '@/shared/wrapper/dashboard';
import { VaultDetails } from '../vault-details';
import { VaultStatus } from '../vault-status';

export const Dashboard = () => {
  const { data: vaultAprData, isAPRLoading } = useVaultApr();
  const { usdAmount, assets, isBalanceLoading, isUSDLoading } =
    useWrapperBalance();

  return (
    <DashboardContainer>
      <DashboardBalanceApy
        isBalanceLoading={isBalanceLoading}
        isUSDAmountLoading={isUSDLoading}
        token={'ETH'}
        balance={assets}
        usdAmount={usdAmount}
        aprData={vaultAprData}
        isAPYLoading={isAPRLoading}
      />
      <VaultStatus showMint={true} showWithdrawalRequests={true} />
      <VaultDetails />
    </DashboardContainer>
  );
};
