import { BasePage } from './base.page';

export class DepositPage extends BasePage {
  get amountInput() {
    return this.page.getByRole('textbox').first();
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Deposit' });
  }

  async fillAmount(amountEth: string) {
    await this.amountInput.fill(amountEth);
  }

  async clickSubmit() {
    await this.submitButton.click();
  }
}
