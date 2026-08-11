import {
  WalletConnectTypes,
  type WalletPage,
} from '@lidofinance/wallets-testing-wallets';
import { expect, type Page } from '@playwright/test';

import { BasePage } from '../pages/base.page';
import { DashboardPage } from '../pages/dashboard.page';
import { DepositPage } from '../pages/deposit.page';
import { ConnectWalletModal } from '../pages/elements/common/element.connectWalletModal';
import { NavigationPage } from '../pages/navigation.page';
import { WithdrawalPage } from '../pages/withdrawal.page';

// Composes page/element objects into the multi-step flows a spec actually
// calls. Page objects (and ConnectWalletModal) only expose locators and
// atomic single-step actions; anything that chains several of those, or
// branches on business logic (e.g. WalletConnect vs. extension wallet), lives
// here — same split as lido-autotests' VaultsService, which is also why
// there's no dedicated ConnectPage: the modal is just an element, and the
// connect flow is this service's job.
export class DwService {
  readonly header: BasePage;
  readonly connectWalletModal: ConnectWalletModal;
  readonly navigation: NavigationPage;
  readonly depositPage: DepositPage;
  readonly withdrawalPage: WithdrawalPage;
  readonly dashboardPage: DashboardPage;

  constructor(
    page: Page,
    private readonly walletPage: WalletPage,
  ) {
    this.header = new BasePage(page);
    this.connectWalletModal = new ConnectWalletModal(page);
    this.navigation = new NavigationPage(page);
    this.depositPage = new DepositPage(page);
    this.withdrawalPage = new WithdrawalPage(page);
    this.dashboardPage = new DashboardPage(page);
  }

  async connectWallet() {
    const { CONNECT_BUTTON_NAME, WALLET_TYPE } =
      this.walletPage.options.walletConfig;

    await this.header.connectButton.click();
    await this.connectWalletModal.acceptTerms();
    await this.connectWalletModal.waitForTileEnabled(CONNECT_BUTTON_NAME);
    await this.connectWalletModal.clickWallet(CONNECT_BUTTON_NAME);

    if (WALLET_TYPE === WalletConnectTypes.WC_SDK) {
      const uri = await this.connectWalletModal.getWalletConnectUri();
      await this.walletPage.connectWallet(uri);
    } else {
      await this.walletPage.connectWallet();
    }

    // connectedAddress only renders inside the account modal (opened by
    // clicking the header's wallet-badge trigger) — the "Connect wallet"
    // button disappearing is the simplest visible proxy for "connected"
    // (confirmed live: header shows the truncated address + 100 ETH deposit
    // limit once connected).
    await expect(
      this.header.connectButton,
      'connect button should disappear once the wallet is connected',
    ).not.toBeVisible();
  }

  async depositEth(amountEth: string) {
    await this.depositPage.fillAmount(amountEth);
    await this.depositPage.clickSubmit();
    await this.confirmTransactions(1);
  }

  async requestWithdrawal(amountEth: string, transactionCount = 1) {
    await this.withdrawalPage.fillAmount(amountEth);
    await this.withdrawalPage.clickSubmit();
    await this.confirmTransactions(transactionCount);
  }

  async requestFullWithdrawal() {
    await this.withdrawalPage.clickMax();
    await this.withdrawalPage.clickSubmit();
    // claimShares() followed by requestExitByWsteth().
    await this.confirmTransactions(2);
  }

  async claimStVault(requestIndex = 0) {
    await this.dashboardPage.claimButton(requestIndex).click();
  }

  async claimEarnWithdrawal(requestIndex = 0) {
    await this.dashboardPage.claimButton(requestIndex).click();
  }

  // StvStrategyPool-only: the "Process" button in the dashboard's
  // "Processable withdrawal requests to stVault" section — creates the
  // actual Lido WithdrawalQueue request after Mellow's own redeem has been
  // claimed.
  async processWithdrawal() {
    await this.dashboardPage.processButton.click();
  }

  private async confirmTransactions(transactionCount: number) {
    for (let index = 0; index < transactionCount; index += 1) {
      await this.walletPage.confirmTx();
    }

    // The success modal covers the tab bar and intercepts clicks. Closing it
    // also navigates to the dashboard tab.
    await this.header.txProgressModal.closeModal();
  }
}
