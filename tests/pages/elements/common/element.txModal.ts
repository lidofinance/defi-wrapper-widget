import type { Hash } from 'viem';
import type { Page } from '@playwright/test';

const TX_HASH_IN_PATH_RE = /\/tx\/(0x[a-fA-F0-9]{64})/;

export class TxModal {
  constructor(private readonly page: Page) {}

  get scanLink() {
    return this.page.getByRole('link', { name: 'View on Etherscan' });
  }

  get goToDashboardButton() {
    return this.page.getByRole('button', { name: 'Go to dashboard' });
  }

  async closeModal() {
    await this.goToDashboardButton.click();
  }

  async extractScanLink(): Promise<string | null> {
    if ((await this.scanLink.count()) === 0) {
      return null;
    }
    return this.scanLink.getAttribute('href');
  }

  async extractTxHashFromScanLink(): Promise<Hash | null> {
    const scanLink = await this.extractScanLink();
    if (!scanLink) {
      return null;
    }
    const match = scanLink.match(TX_HASH_IN_PATH_RE);
    return match ? (match[1] as Hash) : null;
  }
}
