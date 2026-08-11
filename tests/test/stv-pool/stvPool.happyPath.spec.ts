import { parseEther } from 'viem';
import { expect } from '@playwright/test';

import { StvPoolContract } from '../../contracts/stv-pool.contract';
import { WithdrawalQueueContract } from '../../contracts/withdrawal-queue.contract';
import { advanceTime, getPublicClient } from '../../providers';
import { readPoolRegistry } from '../../setup/poolRegistry';
import { test } from '../../test.fixture';
import { getRoleSigner } from '../../testData/accounts';
import { finalizeWithdrawals } from '../../utils/nodeHelpers/finalize';
import { applyVaultReport } from '../../utils/nodeHelpers/lazyOracleMock';

test.use({ poolType: 'StvPool' });

// Milestone 1: StvPool happy path, allowListEnabled=false (open to all — see
// docs/plan/e2e-testing-plan.md). Deposit/requestWithdrawal/claim are all
// permissionless on StvPool; finalize is an operator action never exposed in
// the UI, so it's driven directly via finalizeWithdrawals() rather than a
// page object.
//
// Wallet: WalletConnect (headless SignClient), not a MetaMask extension —
// see pages/elements/common/element.connectWalletModal.ts,
// services/dw.service.ts (connectWallet) and config/walletConfig.ts.
// The worker-scoped dwService fixture imports the role accounts and activates
// the depositor before the scenario starts.
test('deposit, request withdrawal, finalize, claim', async ({
  browserWithWallet,
  dwService,
}) => {
  const depositAmountEth = 1;
  const deployment = readPoolRegistry('StvPool');
  const depositor = getRoleSigner(
    browserWithWallet.ethereumNodeService,
    'depositor',
  );
  const publicClient = getPublicClient();
  const stvPoolContract = new StvPoolContract(deployment.pool);
  const withdrawalQueueContract = new WithdrawalQueueContract(
    deployment.withdrawalQueue,
  );
  let withdrawalRequestId: bigint | undefined;
  const getWithdrawalRequest = async () => {
    if (withdrawalRequestId === undefined) {
      throw new Error('Created withdrawal request was not found');
    }
    const [request] = await withdrawalQueueContract.getWithdrawalStatusBatch([
      withdrawalRequestId,
    ]);
    if (request === undefined) {
      throw new Error(
        `Withdrawal request ${withdrawalRequestId} was not found`,
      );
    }
    return request;
  };

  const walletPage = browserWithWallet.getWalletPage();

  await test.step('Connect wallet', async () => {
    await dwService.depositPage.goto();
    await dwService.connectWallet();
  });

  await test.step(`Deposit ${depositAmountEth} ETH`, async () => {
    const assetsBefore = await stvPoolContract.assetsOf(depositor.address);

    await dwService.navigation.goToDeposit();
    await dwService.depositEth(depositAmountEth.toString());

    const assetsAfter = await stvPoolContract.assetsOf(depositor.address);
    expect(
      assetsAfter - assetsBefore,
      'on-chain assets should increase by the deposited amount',
    ).toBe(parseEther(depositAmountEth.toString()));

    await dwService.navigation.goToDashboard();
    await expect(
      dwService.dashboardPage.getVaultBalanceValue(),
      `vault balance should show ${depositAmountEth} ETH after deposit`,
    ).toHaveText(new RegExp(`^${depositAmountEth}(\\.0+)?\\s*ETH$`));
  });

  await test.step('Request withdrawal', async () => {
    const requestIdsBefore = await withdrawalQueueContract.withdrawalRequestsOf(
      depositor.address,
    );

    await dwService.navigation.goToWithdraw();
    await dwService.requestWithdrawal(depositAmountEth.toString());

    const requestIdsAfter = await withdrawalQueueContract.withdrawalRequestsOf(
      depositor.address,
    );
    const newRequestIds = requestIdsAfter.filter(
      (requestId) => !requestIdsBefore.includes(requestId),
    );
    expect(
      newRequestIds,
      'withdrawal should create exactly one request',
    ).toHaveLength(1);

    withdrawalRequestId = newRequestIds[0];
    if (withdrawalRequestId === undefined) {
      throw new Error('Created withdrawal request was not found');
    }

    const request = await getWithdrawalRequest();
    expect(request.owner.toLowerCase(), 'request owner').toBe(
      depositor.address.toLowerCase(),
    );
    expect(request.amountOfAssets, 'request assets').toBeGreaterThan(0n);
    expect(request.isFinalized, 'request should be pending').toBe(false);
    expect(request.isClaimed, 'request should not be claimed').toBe(false);
    expect(
      await stvPoolContract.assetsOf(depositor.address),
      'full withdrawal should remove all active assets',
    ).toBe(0n);

    await expect(
      dwService.dashboardPage.pendingWithdrawalRequestsSection,
      'pending withdrawal section should be visible',
    ).toBeVisible();
  });

  await test.step('Finalize (operator action, off-UI)', async () => {
    // WithdrawalQueue.finalize() gates on both MIN_WITHDRAWAL_DELAY_TIME
    // (3600s since the request) and the request's timestamp <= the latest
    // report timestamp — advancing time alone doesn't create a new report,
    // so after clearing the delay we re-inject one (unchanged value) dated
    // after the withdrawal request.
    await advanceTime(3700);
    await applyVaultReport(deployment.vault, deployment.dashboard);
    await finalizeWithdrawals(
      browserWithWallet.ethereumNodeService,
      deployment.withdrawalQueue,
    );

    const request = await getWithdrawalRequest();
    expect(request.isFinalized, 'request should be finalized').toBe(true);
    expect(request.isClaimed, 'finalized request should not be claimed').toBe(
      false,
    );

    // Finalize runs off-UI (direct on-chain calls, not through the widget),
    // so the widget's cached query state doesn't know the request is
    // finalized until a reload re-fetches it — confirmed live: without this
    // the Claim button stays disabled/stale.
    await dwService.dashboardPage.reload();

    await expect(
      dwService.dashboardPage.pendingWithdrawalRequestsSection,
      'pending withdrawal section should disappear after finalization',
    ).not.toBeVisible();
    await expect(
      dwService.dashboardPage.availableToClaimSection,
      'available to claim section should be visible',
    ).toBeVisible();
    await expect(
      dwService.dashboardPage.claimButton(),
      'claim button should be enabled',
    ).toBeEnabled();
  });

  await test.step('Claim', async () => {
    const getEthBalance = () =>
      publicClient.getBalance({ address: depositor.address });

    const requestBeforeClaim = await getWithdrawalRequest();
    const balanceBefore = await getEthBalance();

    await dwService.navigation.goToDashboard();
    await dwService.claimStVault();
    await walletPage.confirmTx();

    const txHash =
      await dwService.dashboardPage.txProgressModal.extractTxHashFromScanLink();
    expect(txHash, 'claim transaction hash should be present').not.toBeNull();
    if (txHash === null) {
      throw new Error('Claim transaction hash was not found');
    }

    await dwService.dashboardPage.txProgressModal.closeModal();

    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    const balanceAfter = await getEthBalance();
    const gasCost = receipt.gasUsed * receipt.effectiveGasPrice;
    const netReceived = balanceAfter - balanceBefore + gasCost;

    expect(
      netReceived,
      'depositor should receive exactly the finalized request assets',
    ).toBe(requestBeforeClaim.amountOfAssets);

    const requestAfterClaim = await getWithdrawalRequest();
    expect(requestAfterClaim.isFinalized, 'request should stay finalized').toBe(
      true,
    );
    expect(requestAfterClaim.isClaimed, 'request should be claimed').toBe(true);

    await expect(
      dwService.dashboardPage.availableToClaimSection,
      'available to claim section should disappear',
    ).not.toBeVisible();
    await expect(
      dwService.navigation.tab('Dashboard'),
      'dashboard should be hidden for an empty position',
    ).not.toBeVisible();
    await expect(
      dwService.navigation.tab('Deposit'),
      'deposit tab should remain available',
    ).toBeVisible();
  });
});
