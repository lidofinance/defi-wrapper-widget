import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  get pendingWithdrawalRequestsSection() {
    return this.page.getByText('Pending withdrawal requests', { exact: true });
  }

  get availableToClaimSection() {
    return this.page.getByText('Available to claim', { exact: true });
  }

  get mintedStethSection() {
    return this.page.getByTestId('mintedStethSection');
  }

  get pendingEarnWithdrawalsSection() {
    return this.page.getByText('Pending withdrawals from Lido Earn ETH', {
      exact: true,
    });
  }

  get claimableEarnWithdrawalsSection() {
    return this.page.getByText('Claimable withdrawals from Lido Earn ETH', {
      exact: true,
    });
  }

  get processableStvaultWithdrawalsSection() {
    return this.page.getByText('Processable withdrawal requests to stVault', {
      exact: true,
    });
  }

  get pendingStvaultWithdrawalsSection() {
    return this.page.getByText('Pending withdrawal requests from stVault', {
      exact: true,
    });
  }

  claimButton(requestIndex = 0) {
    return this.page.getByRole('button', { name: 'Claim' }).nth(requestIndex);
  }

  get processButton() {
    return this.page.getByRole('button', { name: 'Process' });
  }

  getVaultBalanceLabel() {
    return this.page.getByText('My vault balance', { exact: true });
  }

  getVaultBalanceValue() {
    return this.page.getByTestId('vaultBalanceValue');
  }
}
