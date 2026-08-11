import { TxModal } from './elements/common/element.txModal';
import type { Page } from '@playwright/test';

export class BasePage {
  txProgressModal: TxModal;

  constructor(protected readonly page: Page) {
    this.txProgressModal = new TxModal(page);
  }

  async goto() {
    await this.page.goto('/');
  }

  async reload() {
    await this.page.reload();
  }

  // Header trigger for the reef-knot "Choose wallet" modal — present on
  // every tab (src/shared/wallet/connect/connect.tsx).
  get connectButton() {
    return this.page.getByTestId('connectBtn');
  }
}
