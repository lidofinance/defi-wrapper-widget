import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useInvalidateWrapper } from '@/modules/defi-wrapper';
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
import { useGGVStrategy } from './use-ggv-strategy';

type GGVWithdrawalToProcessParams = {
  stvToWithdraw: bigint;
  sharesToRepay: bigint;
  sharesToRebalance: bigint;
  ethToReceive: bigint;
};

export const useGGVProcessWithdrawal = () => {
  const { address } = useDappStatus();
  const invalidateWrapper = useInvalidateWrapper();
  const { onTransactionStageChange } = useTransactionModal();
  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });
  const prepareReportCalls = useReportCalls();
  const { data: ggvData } = useGGVStrategy();

  return {
    processWithdrawal: useCallback(
      async ({
        stvToWithdraw,
        sharesToRepay,
        sharesToRebalance,
        ethToReceive,
      }: GGVWithdrawalToProcessParams) => {
        invariant(ggvData, '[useGGVProcessWithdrawal] ggvData is undefined');
        invariant(address, '[useGGVProcessWithdrawal] address is undefined');

        const { ggvStrategyContract } = ggvData;

        const formatted = formatBalance(ethToReceive).actual;

        // TODO: add text for healing
        const { success } = await withSuccess(
          sendTX({
            successText: `Withdrawal of ${formatted} ETH processed`,
            successDescription: `You can claim your funds after the withdrawal process finished. Waiting time is approximately 7 days.`,
            flow: 'withdrawal',
            AATitleText: `Withdrawal of ${formatted} ETH processed`,
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
            transactions: async () => {
              const calls: TransactionEntry[] = [];
              const reportCalls = await prepareReportCalls();
              // report
              calls.push(...reportCalls);

              invariant(
                sharesToRepay <= 0n && stvToWithdraw <= 0n,
                'Nothing to process',
              );

              // repay
              if (sharesToRepay > 0n) {
                calls.push({
                  ...ggvStrategyContract.encode.burnWsteth([sharesToRepay]),
                });
              }

              if (stvToWithdraw > 0n) {
                // request withdrawal
                calls.push({
                  ...ggvStrategyContract.encode.requestWithdrawalFromPool([
                    address,
                    stvToWithdraw,
                    sharesToRebalance,
                  ]),
                });
              }

              return calls;
            },
          }),
        );

        // We call invalidate here, because there is no form submission, just button
        await invalidateWrapper();

        return success;
      },
      [address, ggvData, invalidateWrapper, prepareReportCalls, sendTX],
    ),
    ...rest,
  };
};
