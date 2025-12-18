import { useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';
import { useStvPool } from '@/modules/defi-wrapper';
import { getWethContract, useReportCalls } from '@/modules/vaults';
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
import { getReferralAddress } from '@/shared/wrapper/refferals/get-refferal-address';
import { formatBalance } from '@/utils/formatBalance';
import { tokenLabel } from '@/utils/token-label';
import type { DepositFormValidatedValues } from './types';

export const useDeposit = () => {
  const { address } = useDappStatus();
  const publicClient = usePublicClient();
  const { wrapper } = useStvPool();
  const { onTransactionStageChange } = useTransactionModal();

  const prepareReportCalls = useReportCalls();

  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });

  return {
    deposit: useCallback(
      async ({ amount, token, referral }: DepositFormValidatedValues) => {
        invariant(wrapper, '[useDeposit] wrapper is undefined');
        invariant(address, '[useDeposit] address is undefined');
        const wethContract = getWethContract(publicClient);

        const depositedETHAmount = formatBalance(amount).actual;
        const TXTitle = `Depositing ${depositedETHAmount} ${tokenLabel('ETH')} to the vault`;
        const { success } = await withSuccess(
          sendTX({
            successText: `${depositedETHAmount} ${tokenLabel(token)} has been deposited to the vault`,
            AATitleText: TXTitle,
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
            flow: 'deposit',
            transactions: async () => {
              const calls: TransactionEntry[] = [];
              if (token === 'WETH') {
                calls.push({
                  ...wethContract.encode.withdraw([amount]),
                  loadingText: `Unwrapping ${tokenLabel('WETH')} to ${depositedETHAmount} ${tokenLabel('ETH')}`,
                  signingDescription: DEFAULT_SIGNING_DESCRIPTION,
                  loadingDescription: DEFAULT_LOADING_DESCRIPTION,
                });
              }

              const reportCalls = await prepareReportCalls();
              calls.push(...reportCalls);

              const referralAddress = await getReferralAddress(
                referral,
                publicClient,
              );

              calls.push({
                ...wrapper.encode.depositETH([address, referralAddress]),
                value: amount,
                loadingText: TXTitle,
                signingDescription: DEFAULT_SIGNING_DESCRIPTION,
                loadingDescription: DEFAULT_LOADING_DESCRIPTION,
              });

              return calls;
            },
          }),
        );

        return success;
      },
      [address, prepareReportCalls, publicClient, sendTX, wrapper],
    ),
    ...rest,
  };
};
