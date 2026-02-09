import { useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';
import {
  useConvert,
  useStvSteth,
  calculateStethSharesToRepay,
} from '@/modules/defi-wrapper';
import { useReportCalls, useVault } from '@/modules/vaults';
import {
  TransactionEntry,
  useDappStatus,
  useLidoSDK,
  useSendTransaction,
  withSuccess,
} from '@/modules/web3';
import {
  DEFAULT_LOADING_DESCRIPTION,
  DEFAULT_SIGNING_DESCRIPTION,
  useTransactionModal,
} from '@/shared/components/transaction-modal';
import { maxBN, minBN } from '@/utils/bn';
import { formatBalance } from '@/utils/formatBalance';
import { tokenLabel } from '@/utils/token-label';
import type { RepayTokens, WithdrawalFormValidatedValues } from './types';

export const useWithdrawalRepay = () => {
  const { address } = useDappStatus();
  const publicClient = usePublicClient();
  const { activeVault } = useVault();
  const { wrapper, withdrawalQueue } = useStvSteth();
  const { shares, stETH, wstETH } = useLidoSDK();
  const { onTransactionStageChange } = useTransactionModal();
  const prepareReportCalls = useReportCalls();
  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });
  const { convertFromEthToStv } = useConvert();

  const populateRepaymentApproveIfNeeded = useCallback(
    async (
      repayToken: RepayTokens,
      repayableAmount: bigint,
      allowance: bigint,
    ) => {
      const calls: TransactionEntry[] = [];
      if (repayableAmount > allowance) {
        const approveArgs = {
          amount: repayableAmount,
          to: wrapper.address,
          account: address,
        };
        const call =
          repayToken === 'WSTETH'
            ? await wstETH.populateApprove(approveArgs)
            : await stETH.populateApprove(approveArgs);

        calls.push({
          ...call,
          loadingText: `Approving ${formatBalance(repayableAmount).actual} ${tokenLabel(
            repayToken,
          )} for repayment`,
          signingDescription: DEFAULT_SIGNING_DESCRIPTION,
          loadingDescription: DEFAULT_LOADING_DESCRIPTION,
        });
      }
      return calls;
    },
    [address, stETH, wrapper, wstETH],
  );

  const getCurrentUserBalanceAndAllowance = useCallback(
    async (token: RepayTokens) => {
      if (token === 'STETH') {
        return {
          balanceRepayToken: await shares.balance(address),
          allowance: await stETH.allowance({
            account: address,
            to: wrapper.address,
          }),
        };
      }
      return {
        balanceRepayToken: await wstETH.balance(address),
        allowance: await wstETH.allowance({
          account: address,
          to: wrapper.address,
        }),
      };
    },
    [wrapper.address, address, stETH, shares, wstETH],
  );
  const getRebalanceableStethShares = useCallback(
    async (
      repayToken: RepayTokens,
      repayableStethShares: bigint,
      stethSharesToRepay: bigint,
    ): Promise<bigint> => {
      const repaidShares =
        repayToken === 'WSTETH'
          ? // steth shares user can repay after wsteth is unwrapped
            await shares.convertToShares(
              await shares.convertToSteth(repayableStethShares),
            )
          : repayableStethShares;

      // steth shares that will be forgiven when rebalancing
      return maxBN(stethSharesToRepay - repaidShares, 0n);
    },
    [shares],
  );

  return {
    withdrawalRepay: useCallback(
      async ({ amount, repayToken }: WithdrawalFormValidatedValues) => {
        invariant(
          withdrawalQueue,
          '[useWithdrawal] withdrawalQueue is undefined',
        );
        invariant(address, '[useWithdrawal] address is undefined');
        invariant(activeVault, '[useWithdrawal] activeVault is undefined');
        const requestedETHAmount = formatBalance(amount).actual;
        const TXText = `${requestedETHAmount} ${tokenLabel('ETH')} has been requested`;
        const { success } = await withSuccess(
          sendTX({
            successText: TXText,
            successDescription: `Request for withdrawal has been sent. You can claim your funds after the withdrawal process finished. Waiting time is approximately 7 days.`,
            flow: 'withdrawal',
            AATitleText: TXText,
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
            transactions: async () => {
              const calls: TransactionEntry[] = [];
              const reportCalls = await prepareReportCalls();
              calls.push(...reportCalls);

              const stethSharesToRepay = await calculateStethSharesToRepay({
                publicClient,
                report: activeVault.report,
                wrapper,
                stvWithdrawAmountInEth: amount,
                account: address,
              });
              const { balanceRepayToken, allowance } =
                await getCurrentUserBalanceAndAllowance(repayToken);

              // steth shares user can repay with their current balance
              const repayableStethShares = minBN(
                stethSharesToRepay,
                balanceRepayToken,
              );
              const rebalanceableStethShares =
                await getRebalanceableStethShares(
                  repayToken,
                  repayableStethShares,
                  stethSharesToRepay,
                );

              const rebalanceableAmount =
                repayToken === 'WSTETH'
                  ? rebalanceableStethShares
                  : await shares.convertToSteth(rebalanceableStethShares);

              const repayableAmount =
                repayToken === 'WSTETH'
                  ? repayableStethShares
                  : await shares.convertToSteth(repayableStethShares);

              calls.push(
                ...(await populateRepaymentApproveIfNeeded(
                  repayToken,
                  repayableAmount,
                  allowance,
                )),
              );

              if (repayableAmount > 0n) {
                calls.push({
                  ...(repayToken === 'WSTETH'
                    ? wrapper.encode.burnWsteth([repayableStethShares])
                    : wrapper.encode.burnStethShares([repayableStethShares])),
                  loadingText: `Repaying ${formatBalance(repayableAmount).actual} ${tokenLabel(repayToken)}`,
                  signingDescription: DEFAULT_SIGNING_DESCRIPTION,
                  loadingDescription: DEFAULT_LOADING_DESCRIPTION,
                });
              }

              const amountInStv = await convertFromEthToStv(
                publicClient,
                activeVault.report,
                amount,
              );

              if (amountInStv <= 0n) {
                throw new Error(
                  `[useWithdrawalRepay] calculated amountInStv is 0 for requested ETH amount: ${requestedETHAmount}`,
                );
              }

              const rebalancingText = `${formatBalance(rebalanceableAmount).actual} ${tokenLabel(repayToken)}`;
              let loadingText = `Requesting ${requestedETHAmount} ${tokenLabel('ETH')} from the vault. `;
              if (rebalanceableAmount > 0n) {
                loadingText += `Rebalancing ${rebalancingText}`;
              }

              calls.push({
                ...withdrawalQueue.encode.requestWithdrawal([
                  address, // receiver
                  amountInStv, // stvAmount to withdraw
                  rebalanceableStethShares, // steth shares to rebalance
                ]),
                loadingText,
                signingDescription: DEFAULT_SIGNING_DESCRIPTION,
                loadingDescription: DEFAULT_LOADING_DESCRIPTION,
              });

              return calls;
            },
          }),
        );

        return success;
      },
      [
        activeVault,
        address,
        prepareReportCalls,
        publicClient,
        sendTX,
        convertFromEthToStv,
        getCurrentUserBalanceAndAllowance,
        getRebalanceableStethShares,
        populateRepaymentApproveIfNeeded,
        shares,
        withdrawalQueue,
        wrapper,
      ],
    ),
    ...rest,
  };
};
