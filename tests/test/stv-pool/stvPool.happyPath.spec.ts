import { parseEther } from 'viem';
import { expect } from '@playwright/test';

import { StvPoolContract, WithdrawalQueueContract } from '@tests/contracts';
import { advanceTime, getPublicClient } from '@tests/providers';
import {
  getRoleSigner,
  WITHDRAWAL_DELAY_ADVANCE_SECONDS,
} from '@tests/testData';
import { applyVaultReport, finalizeWithdrawals } from '@tests/utils';

import { readPoolRegistry } from '../../setup/poolRegistry';
import { test } from '../../test.fixture';

// allowListEnabled=false, so deposit/request/claim are permissionless.
// finalize has no UI — it's an operator action, called on-chain directly.
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
    expect(
      request.owner.toLowerCase(),
      'request owner should be the depositor',
    ).toBe(depositor.address.toLowerCase());
    expect(
      request.amountOfAssets,
      'request assets should be positive',
    ).toBeGreaterThan(0n);
    expect(request.isFinalized, 'request should be pending').toBe(false);
    expect(request.isClaimed, 'request should not be claimed').toBe(false);
    expect(
      await stvPoolContract.assetsOf(depositor.address),
      'full withdrawal should remove all active assets',
    ).toBe(0n);

    await dwService.navigation.goToDashboard();
    await expect(
      dwService.dashboardPage.pendingWithdrawalRequestsSection,
      'pending withdrawal section should be visible',
    ).toBeVisible();
  });

  await test.step('Finalize (operator action, off-UI)', async () => {
    // finalize() needs both the 3600s delay cleared and a report newer than the
    // request — advancing time alone doesn't produce one.
    await advanceTime(WITHDRAWAL_DELAY_ADVANCE_SECONDS);
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

    // Finalize ran off-UI, so react-query still holds stale state — without
    // this reload the Claim button stays disabled.
    await dwService.dashboardPage.reload();

    // Assert the section that must appear first: a negative check on a page that
    // is still loading passes without proving anything.
    await expect(
      dwService.dashboardPage.availableToClaimSection,
      'available to claim section should be visible',
    ).toBeVisible();
    await expect(
      dwService.dashboardPage.pendingWithdrawalRequestsSection,
      'pending withdrawal section should disappear after finalization',
    ).not.toBeVisible();
    await expect(
      dwService.dashboardPage.claimButton(),
      'claim button should be enabled',
    ).toBeEnabled();
  });

  await test.step('Claim', async () => {
    const getEthBalance = () =>
      publicClient.getBalance({ address: depositor.address });

    const requestBeforeClaim = await getWithdrawalRequest();
    if (withdrawalRequestId === undefined) {
      throw new Error('Created withdrawal request was not found');
    }
    // Checkpoint rounding and finalize()'s gas-cost coverage can make the
    // claimable amount smaller than the requested assets.
    const claimableEther =
      await withdrawalQueueContract.getClaimableEther(withdrawalRequestId);
    const balanceBefore = await getEthBalance();

    expect(claimableEther, 'claimable ETH should be positive').toBeGreaterThan(
      0n,
    );
    expect(
      claimableEther,
      'claimable ETH should not exceed the requested assets',
    ).toBeLessThanOrEqual(requestBeforeClaim.amountOfAssets);

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
      'depositor should receive exactly the checkpoint-adjusted claimable ETH',
    ).toBe(claimableEther);

    const requestAfterClaim = await getWithdrawalRequest();
    expect(requestAfterClaim.isFinalized, 'request should stay finalized').toBe(
      true,
    );
    expect(requestAfterClaim.isClaimed, 'request should be claimed').toBe(true);

    await expect(
      dwService.navigation.tab('Deposit'),
      'deposit tab should remain available',
    ).toBeVisible();
    await expect(
      dwService.dashboardPage.availableToClaimSection,
      'available to claim section should disappear',
    ).not.toBeVisible();
    await expect(
      dwService.navigation.tab('Dashboard'),
      'dashboard should be hidden for an empty position',
    ).not.toBeVisible();
  });
});
