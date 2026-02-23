import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useInvalidateWrapper, useStvStrategy } from '@/modules/defi-wrapper';
import { useReportCalls } from '@/modules/vaults';
import {
  TransactionEntry,
  useDappStatus,
  useSendTransaction,
  withSuccess,
} from '@/modules/web3';
import {
  DEFAULT_LOADING_DESCRIPTION,
  DEFAULT_SIGNING_DESCRIPTION,
  useTransactionModal,
} from '@/shared/components/transaction-modal';
import { formatBalance } from '@/utils/formatBalance';

type WithdrawalToProcessParams = {
  stvToWithdraw: bigint;
  sharesToRepay: bigint;
  sharesToRebalance: bigint;
  ethToReceive: bigint;
};

export const useProcessWithdrawal = () => {
  const { address } = useDappStatus();
  const invalidateWrapper = useInvalidateWrapper();
  const { onTransactionStageChange } = useTransactionModal();
  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });
  const prepareReportCalls = useReportCalls();
  const { strategy } = useStvStrategy();

  return {
    processWithdrawal: useCallback(
      async ({
        stvToWithdraw,
        sharesToRepay,
        sharesToRebalance,
        ethToReceive,
      }: WithdrawalToProcessParams) => {
        invariant(strategy, '[useProcessWithdrawal] strategy is undefined');
        invariant(address, '[useProcessWithdrawal] address is undefined');

        const formatted = formatBalance(ethToReceive).actual;

        const isHealingOnly = stvToWithdraw <= 0n && sharesToRepay > 0n;

        const successText = isHealingOnly
          ? `Posisition healed by repaying shares`
          : `Withdrawal of ${formatted} ETH processed`;

        const successDescription = isHealingOnly
          ? `You have successfully repaid shares to heal your position.`
          : `You can claim your funds after the withdrawal process finished. Waiting time is approximately 7 days.`;

        const { success } = await withSuccess(
          sendTX({
            successText,
            successDescription,
            flow: 'withdrawal',
            AATitleText: successText,
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
            transactions: async () => {
              const calls: TransactionEntry[] = [];

              // report
              calls.push(...prepareReportCalls());

              // repay
              if (sharesToRepay > 0n) {
                calls.push({
                  ...strategy.encode.burnWsteth([sharesToRepay]),
                });
              }

              if (stvToWithdraw > 0n) {
                // request withdrawal
                calls.push({
                  ...strategy.encode.requestWithdrawalFromPool([
                    address,
                    stvToWithdraw,
                    sharesToRebalance,
                  ]),
                });
              }

              invariant(calls.length !== 0, 'Nothing to process');

              return calls;
            },
          }),
        );

        // We call invalidate here, because there is no form submission, just button
        await invalidateWrapper();

        return success;
      },
      [address, strategy, invalidateWrapper, prepareReportCalls, sendTX],
    ),
    ...rest,
  };
};
