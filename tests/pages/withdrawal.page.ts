import { BasePage } from './base.page';

export class WithdrawalPage extends BasePage {
  get amountInput() {
    return this.page.getByPlaceholder(/amount/i);
  }

  get submitButton() {
    return this.page.getByRole('button', { name: /^Withdraw/ });
  }

  get maxButton() {
    return this.page.getByRole('button', { name: 'MAX' });
  }

  async fillAmount(amountEth: string) {
    await this.amountInput.fill(amountEth);
  }

  async clickMax() {
    await this.maxButton.click();
  }

  async clickSubmit() {
    await this.submitButton.click();
  }
}
