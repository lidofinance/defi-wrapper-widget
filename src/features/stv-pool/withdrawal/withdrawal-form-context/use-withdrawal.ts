import { useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';
import { useConvert, useStvPool } from '@/modules/defi-wrapper';
import { useReportCalls, useVault } from '@/modules/vaults';
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
import { tokenLabel } from '@/utils/token-label';

import type { WithdrawalFormValidatedValues } from './types';

export const useWithdrawal = () => {
  const { address } = useDappStatus();
  const publicClient = usePublicClient();
  const { activeVault } = useVault();
  const { withdrawalQueue } = useStvPool();
  const { onTransactionStageChange } = useTransactionModal();
  const prepareReportCalls = useReportCalls();
  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });
  const { convertFromEthToStv } = useConvert();

  return {
    withdrawal: useCallback(
      async ({ amount }: WithdrawalFormValidatedValues) => {
        invariant(
          withdrawalQueue,
          '[useWithdrawal] withdrawalQueue is undefined',
        );
        invariant(address, '[useWithdrawal] address is undefined');
        invariant(activeVault, '[useWithdrawal] activeVault is undefined');
        const requestedETHAmount = formatBalance(amount).actual;

        const { success } = await withSuccess(
          sendTX({
            successText: `${requestedETHAmount} ${tokenLabel('ETH')} has been requested`,
            successDescription: `Request for withdrawal has been sent. You can claim your funds after the withdrawal process finished. Waiting time is approximately 7 days.`,
            flow: 'withdrawal',
            AATitleText: `${requestedETHAmount} ${tokenLabel('ETH')} has been requested`,
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
            transactions: async () => {
              const calls: TransactionEntry[] = [];
              const reportCalls = await prepareReportCalls();
              calls.push(...reportCalls);

              // todo: extreme share rate might cause amountInStv to be rightfully 0
              const amountInStv = await convertFromEthToStv(
                publicClient,
                activeVault.report,
                amount,
              );

              calls.push({
                ...withdrawalQueue.encode.requestWithdrawal([
                  address,
                  amountInStv,
                  0n, // use 0 for stvPool because no mininting
                ]),
                loadingText: `Requesting ${requestedETHAmount} ${tokenLabel('ETH')} from the vault`,
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
        convertFromEthToStv,
        withdrawalQueue,
        prepareReportCalls,
        publicClient,
        sendTX,
      ],
    ),
    ...rest,
  };
};
