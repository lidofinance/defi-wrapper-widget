import { BasePage } from './base.page';

export class NavigationPage extends BasePage {
  tab(name: 'Dashboard' | 'Deposit' | 'Withdraw') {
    return this.page.getByRole('tab', { name });
  }

  async goToDeposit() {
    await this.tab('Deposit').click();
  }

  async goToWithdraw() {
    await this.tab('Withdraw').click();
  }

  async goToDashboard() {
    await this.tab('Dashboard').click();
  }
}
