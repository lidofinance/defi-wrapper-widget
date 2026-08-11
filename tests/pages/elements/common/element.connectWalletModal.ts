import { expect, type Locator, type Page } from '@playwright/test';

import { WALLET_TILE_ENABLED_TIMEOUT } from '../../../testData/timeouts';

// Locators + atomic single-step actions for the reef-knot "Choose wallet"
// modal (src/shared/wallet/connect/connect.tsx). Ported from
// lido-autotests/tests/vaults/pages/elements/common/
// element.connectWalletModal.ts + element.termAndPrivacy.ts — same modal as
// the vaults widget. Multi-step orchestration (open -> accept terms -> wait
// for tile -> pick tile -> read URI / hand off to extension) lives in
// DwService.connectWallet(), not here.
export class ConnectWalletModal {
  constructor(private readonly page: Page) {}

  get termsLabel(): Locator {
    return this.page.getByText(/I certify that I have read/);
  }

  tile(name: string): Locator {
    return this.page.getByRole('button', { name });
  }

  async acceptTerms() {
    await this.termsLabel.check();
  }

  async waitForTileEnabled(name: string) {
    await expect(this.tile(name)).toBeEnabled({
      timeout: WALLET_TILE_ENABLED_TIMEOUT,
    });
  }

  async clickWallet(name: string) {
    await this.tile(name).dblclick();
  }

  // WalletConnect's QR modal renders the pairing URI on a `wui-qr-code`
  // element's `uri` attribute.
  async getWalletConnectUri(): Promise<string> {
    const qr = this.page.getByTestId('wui-qr-code');
    await qr.waitFor({ state: 'visible' });
    const uri = await qr.getAttribute('uri');
    if (!uri) {
      throw new Error('WalletConnect QR code "uri" attribute is missing');
    }
    return uri;
  }
}
