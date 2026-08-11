import { expect } from '@playwright/test';

import { MellowStrategyContract } from '../../contracts/mellow-strategy.contract';
import { WithdrawalQueueContract } from '../../contracts/withdrawal-queue.contract';
import { advanceTime, getPublicClient } from '../../providers';
import { readPoolRegistry } from '../../setup/poolRegistry';
import { test } from '../../test.fixture';
import { getRoleSigner } from '../../testData/accounts';
import { finalizeWithdrawals } from '../../utils/nodeHelpers/finalize';
import { applyVaultReport } from '../../utils/nodeHelpers/lazyOracleMock';
import {
  handleMellowBatches,
  submitMellowReport,
} from '../../utils/nodeHelpers/mellowMock';

test.use({ poolType: 'StvStrategyPool' });

test('deposit, exit Mellow, process, finalize, claim', async ({
  browserWithWallet,
  dwService,
}) => {
  const depositAmountEth = 1;
  const deployment = readPoolRegistry('StvStrategyPool');
  const depositor = getRoleSigner(
    browserWithWallet.ethereumNodeService,
    'depositor',
  );
  const publicClient = getPublicClient();
  const mellowStrategyContract = new MellowStrategyContract(
    deployment.strategy,
  );
  const withdrawalQueueContract = new WithdrawalQueueContract(
    deployment.withdrawalQueue,
  );
  const [
    initialStv,
    initialMintedShares,
    initialMellowShares,
    initialClaimableShares,
    initialActiveShares,
    initialDepositRequest,
  ] = await Promise.all([
    mellowStrategyContract.stvOf(depositor.address),
    mellowStrategyContract.mintedStethSharesOf(depositor.address),
    mellowStrategyContract.sharesOf(depositor.address),
    mellowStrategyContract.claimableSharesOf(depositor.address),
    mellowStrategyContract.activeSharesOf(depositor.address),
    mellowStrategyContract.getDepositRequestOf(depositor.address),
  ]);

  let stvAfterDeposit: bigint | undefined;
  let mintedSharesAfterDeposit: bigint | undefined;
  let depositRequestAssets: bigint | undefined;
  let depositRequestTimestamp: bigint | undefined;
  let mellowRequestTimestamp: bigint | undefined;
  let lidoWithdrawalRequestId: bigint | undefined;

  const getMellowRequest = async () => {
    if (mellowRequestTimestamp === undefined) {
      throw new Error('Created Mellow withdrawal request was not found');
    }
    const requests = await mellowStrategyContract.getRedeemQueueRequests(
      depositor.address,
    );
    const request = requests.find(
      ({ timestamp }) => timestamp === mellowRequestTimestamp,
    );
    if (request === undefined) {
      throw new Error(
        `Mellow withdrawal request ${mellowRequestTimestamp} was not found`,
      );
    }
    return request;
  };

  const getLidoWithdrawalRequest = async () => {
    if (lidoWithdrawalRequestId === undefined) {
      throw new Error('Created Lido withdrawal request was not found');
    }
    const [request] = await withdrawalQueueContract.getWithdrawalStatusBatch([
      lidoWithdrawalRequestId,
    ]);
    if (request === undefined) {
      throw new Error(
        `Lido withdrawal request ${lidoWithdrawalRequestId} was not found`,
      );
    }
    return request;
  };

  const walletPage = browserWithWallet.getWalletPage();

  await test.step('Connect wallet', async () => {
    await dwService.depositPage.goto();
    await dwService.connectWallet();
  });

  await test.step(`Deposit ${depositAmountEth} ETH into the Mellow async queue`, async () => {
    await dwService.navigation.goToDeposit();
    await dwService.depositEth(depositAmountEth.toString());

    const [stv, mintedShares, claimableShares, depositRequest] =
      await Promise.all([
        mellowStrategyContract.stvOf(depositor.address),
        mellowStrategyContract.mintedStethSharesOf(depositor.address),
        mellowStrategyContract.claimableSharesOf(depositor.address),
        mellowStrategyContract.getDepositRequestOf(depositor.address),
      ]);

    expect(stv, 'deposit should create a stVault position').toBeGreaterThan(
      initialStv,
    );
    expect(
      mintedShares,
      'deposit should create stETH liability',
    ).toBeGreaterThan(initialMintedShares);
    expect(
      depositRequest.assets,
      'deposit should enqueue wstETH in Mellow',
    ).toBeGreaterThan(initialDepositRequest.assets);
    expect(
      depositRequest.timestamp,
      'deposit request timestamp',
    ).toBeGreaterThan(initialDepositRequest.timestamp);
    expect(
      depositRequest.isClaimable,
      'deposit should not be claimable before a Mellow report',
    ).toBe(false);
    expect(
      claimableShares,
      'claimable Mellow shares should not change before a report',
    ).toBe(initialClaimableShares);

    stvAfterDeposit = stv;
    mintedSharesAfterDeposit = mintedShares;
    depositRequestAssets = depositRequest.assets;
    depositRequestTimestamp = depositRequest.timestamp;
  });

  await test.step('Make the Mellow deposit claimable', async () => {
    if (
      depositRequestAssets === undefined ||
      depositRequestTimestamp === undefined
    ) {
      throw new Error('Created Mellow deposit request was not found');
    }

    await submitMellowReport();

    const [depositRequest, claimableShares, activeShares, totalShares] =
      await Promise.all([
        mellowStrategyContract.getDepositRequestOf(depositor.address),
        mellowStrategyContract.claimableSharesOf(depositor.address),
        mellowStrategyContract.activeSharesOf(depositor.address),
        mellowStrategyContract.sharesOf(depositor.address),
      ]);

    expect(
      depositRequest.assets,
      'deposit request assets should stay stable',
    ).toBe(depositRequestAssets);
    expect(
      depositRequest.timestamp,
      'deposit request timestamp should stay stable',
    ).toBe(depositRequestTimestamp);
    expect(
      depositRequest.isClaimable,
      'deposit should become claimable after a Mellow report',
    ).toBe(true);
    expect(
      claimableShares,
      'claimable Mellow shares should increase',
    ).toBeGreaterThan(initialClaimableShares);
    expect(
      activeShares,
      'shares should not become active before claimShares',
    ).toBe(initialActiveShares);
    expect(totalShares, 'total Mellow shares should increase').toBeGreaterThan(
      initialMellowShares,
    );

    await dwService.dashboardPage.reload();
    await dwService.navigation.goToDashboard();

    const vaultBalanceText = await dwService.dashboardPage
      .getVaultBalanceValue()
      .textContent();
    expect(
      parseFloat(vaultBalanceText ?? ''),
      `vault balance should read ~${depositAmountEth} ETH`,
    ).toBeCloseTo(depositAmountEth, 2);
  });

  await test.step('Request exit from Mellow', async () => {
    if (
      stvAfterDeposit === undefined ||
      mintedSharesAfterDeposit === undefined
    ) {
      throw new Error('Deposited strategy position was not found');
    }

    const redeemRequestsBefore =
      await mellowStrategyContract.getRedeemQueueRequests(depositor.address);

    await dwService.navigation.goToWithdraw();
    await dwService.requestFullWithdrawal();

    const [
      redeemRequestsAfter,
      claimableShares,
      activeShares,
      totalShares,
      currentStv,
      currentMintedShares,
    ] = await Promise.all([
      mellowStrategyContract.getRedeemQueueRequests(depositor.address),
      mellowStrategyContract.claimableSharesOf(depositor.address),
      mellowStrategyContract.activeSharesOf(depositor.address),
      mellowStrategyContract.sharesOf(depositor.address),
      mellowStrategyContract.stvOf(depositor.address),
      mellowStrategyContract.mintedStethSharesOf(depositor.address),
    ]);
    const newRequests = redeemRequestsAfter.filter(
      (request) =>
        !redeemRequestsBefore.some(
          ({ timestamp }) => timestamp === request.timestamp,
        ),
    );

    expect(
      newRequests,
      'withdrawal should create one Mellow request',
    ).toHaveLength(1);
    const [newRequest] = newRequests;
    if (newRequest === undefined) {
      throw new Error('Created Mellow withdrawal request was not found');
    }
    mellowRequestTimestamp = newRequest.timestamp;

    expect(newRequest.shares, 'Mellow request shares').toBeGreaterThan(0n);
    expect(
      newRequest.isClaimable,
      'Mellow request should initially be pending',
    ).toBe(false);
    expect(claimableShares, 'claimable shares should be consumed').toBe(
      initialClaimableShares,
    );
    expect(activeShares, 'active shares should be moved into the request').toBe(
      initialActiveShares,
    );
    expect(
      totalShares,
      'Mellow shares should return to their initial value',
    ).toBe(initialMellowShares);
    expect(currentStv, 'stVault position should remain until Process').toBe(
      stvAfterDeposit,
    );
    expect(currentMintedShares, 'liability should remain until Process').toBe(
      mintedSharesAfterDeposit,
    );

    await dwService.dashboardPage.reload();
    await dwService.navigation.goToDashboard();
    await expect(
      dwService.dashboardPage.pendingEarnWithdrawalsSection,
      'pending Lido Earn withdrawal should be visible',
    ).toBeVisible();
    await expect(
      dwService.dashboardPage.claimableEarnWithdrawalsSection,
      'claimable Lido Earn withdrawal should not be visible yet',
    ).not.toBeVisible();
  });

  await test.step('Make the Mellow withdrawal claimable', async () => {
    await submitMellowReport();
    await handleMellowBatches(depositor);

    const request = await getMellowRequest();
    expect(request.isClaimable, 'Mellow request should become claimable').toBe(
      true,
    );
    expect(request.assets, 'claimable Mellow request assets').toBeGreaterThan(
      0n,
    );

    await dwService.dashboardPage.reload();
    await dwService.navigation.goToDashboard();

    await expect(
      dwService.dashboardPage.pendingEarnWithdrawalsSection,
      'pending Lido Earn withdrawal should disappear',
    ).not.toBeVisible();
    await expect(
      dwService.dashboardPage.claimableEarnWithdrawalsSection,
      'claimable Lido Earn withdrawal should be visible',
    ).toBeVisible();
    await expect(
      dwService.dashboardPage.claimButton(),
      'Mellow claim button should be enabled',
    ).toBeEnabled();
  });

  await test.step('Claim returned wstETH from Mellow', async () => {
    const request = await getMellowRequest();
    const wstethBefore = await mellowStrategyContract.wstethOf(
      depositor.address,
    );

    await dwService.claimEarnWithdrawal();
    await walletPage.confirmTx();
    await dwService.dashboardPage.txProgressModal.closeModal();

    const wstethAfter = await mellowStrategyContract.wstethOf(
      depositor.address,
    );
    expect(
      wstethAfter - wstethBefore,
      'Mellow claim should return the request assets as wstETH',
    ).toBe(request.assets);

    await dwService.dashboardPage.reload();
    await dwService.navigation.goToDashboard();
    await expect(
      dwService.dashboardPage.claimableEarnWithdrawalsSection,
      'claimable Lido Earn withdrawal should disappear',
    ).not.toBeVisible();
    await expect(
      dwService.dashboardPage.processableStvaultWithdrawalsSection,
      'processable stVault withdrawal should be visible',
    ).toBeVisible();
    await expect(
      dwService.dashboardPage.processButton,
      'Process button should be enabled',
    ).toBeEnabled();
  });

  await test.step('Process the stVault withdrawal', async () => {
    const requestIdsBefore = await withdrawalQueueContract.withdrawalRequestsOf(
      depositor.address,
    );
    const [stvBeforeProcess, mintedSharesBeforeProcess] = await Promise.all([
      mellowStrategyContract.stvOf(depositor.address),
      mellowStrategyContract.mintedStethSharesOf(depositor.address),
    ]);

    await dwService.processWithdrawal();
    await walletPage.confirmTx();
    await walletPage.confirmTx();
    await dwService.dashboardPage.txProgressModal.closeModal();

    const requestIdsAfter = await withdrawalQueueContract.withdrawalRequestsOf(
      depositor.address,
    );
    const newRequestIds = requestIdsAfter.filter(
      (requestId) => !requestIdsBefore.includes(requestId),
    );
    expect(
      newRequestIds,
      'Process should create one Lido withdrawal request',
    ).toHaveLength(1);
    lidoWithdrawalRequestId = newRequestIds[0];
    if (lidoWithdrawalRequestId === undefined) {
      throw new Error('Created Lido withdrawal request was not found');
    }

    const request = await getLidoWithdrawalRequest();
    expect(request.owner.toLowerCase(), 'Lido request owner').toBe(
      depositor.address.toLowerCase(),
    );
    expect(
      request.amountOfStv,
      'Lido request should contain the full stv position',
    ).toBe(stvBeforeProcess - initialStv);
    expect(request.amountOfAssets, 'Lido request assets').toBeGreaterThan(0n);
    expect(request.isFinalized, 'Lido request should be pending').toBe(false);
    expect(request.isClaimed, 'Lido request should not be claimed').toBe(false);
    expect(
      await mellowStrategyContract.stvOf(depositor.address),
      'Process should remove the stVault position',
    ).toBe(initialStv);
    expect(
      await mellowStrategyContract.mintedStethSharesOf(depositor.address),
      'Process should clear the stETH liability',
    ).toBe(initialMintedShares);
    expect(
      mintedSharesBeforeProcess,
      'Process should start with outstanding liability',
    ).toBeGreaterThan(initialMintedShares);

    await dwService.navigation.goToDashboard();
    await expect(
      dwService.dashboardPage.processableStvaultWithdrawalsSection,
      'processable stVault withdrawal should disappear',
    ).not.toBeVisible();
    await expect(
      dwService.dashboardPage.pendingStvaultWithdrawalsSection,
      'pending stVault withdrawal should be visible',
    ).toBeVisible();
  });

  await test.step('Finalize the Lido withdrawal', async () => {
    await advanceTime(3700);
    await applyVaultReport(deployment.vault, deployment.dashboard);
    await finalizeWithdrawals(
      browserWithWallet.ethereumNodeService,
      deployment.withdrawalQueue,
    );

    const request = await getLidoWithdrawalRequest();
    expect(request.isFinalized, 'Lido request should be finalized').toBe(true);
    expect(request.isClaimed, 'finalized request should not be claimed').toBe(
      false,
    );

    await dwService.dashboardPage.reload();
    await expect(
      dwService.dashboardPage.pendingStvaultWithdrawalsSection,
      'pending stVault withdrawal should disappear',
    ).not.toBeVisible();
    await expect(
      dwService.dashboardPage.availableToClaimSection,
      'available to claim section should be visible',
    ).toBeVisible();
    await expect(
      dwService.dashboardPage.claimButton(),
      'Lido claim button should be enabled',
    ).toBeEnabled();
  });

  await test.step('Claim ETH from the Lido withdrawal queue', async () => {
    const getEthBalance = () =>
      publicClient.getBalance({ address: depositor.address });
    const requestBeforeClaim = await getLidoWithdrawalRequest();
    if (lidoWithdrawalRequestId === undefined) {
      throw new Error('Created Lido withdrawal request was not found');
    }
    const claimableEther = await withdrawalQueueContract.getClaimableEther(
      lidoWithdrawalRequestId,
    );
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

    const requestAfterClaim = await getLidoWithdrawalRequest();
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
