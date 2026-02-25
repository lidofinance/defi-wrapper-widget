import { useCallback } from 'react';
import { Hex, numberToHex, pad } from 'viem';
import invariant from 'tiny-invariant';
import { useInvalidateWrapper } from '@/modules/defi-wrapper';
import { useDappStatus, useSendTransaction, withSuccess } from '@/modules/web3';
import {
  DEFAULT_LOADING_DESCRIPTION,
  DEFAULT_SIGNING_DESCRIPTION,
  useTransactionModal,
} from '@/shared/components/transaction-modal';
import { useEarnStrategy } from './use-earn-strategy';

type FinalizeEarnWithdrawalParams = {
  requestTimestamp: bigint;
};

const timestampToRequestId = (timestamp: bigint): Hex => {
  // 1. Convert the bigint to a hex string
  const timestampHex = numberToHex(timestamp);

  // 2. Pad it to 32 bytes (64 hex characters + '0x' prefix)
  // This places the timestamp at the end of the 32-byte word
  const requestId = pad(timestampHex, { size: 32 });

  return requestId;
};

export const useFinalizeEarnWithdrawal = () => {
  const { address } = useDappStatus();
  const invalidateWrapper = useInvalidateWrapper();
  const { onTransactionStageChange } = useTransactionModal();
  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });
  const { data: earnStrategy } = useEarnStrategy();

  return {
    finalizeEarnWithdrawal: useCallback(
      async ({ requestTimestamp }: FinalizeEarnWithdrawalParams) => {
        const requestId = timestampToRequestId(requestTimestamp);
        invariant(
          earnStrategy,
          '[useFinalizeEarnWithdrawal] earnStrategy is undefined',
        );
        invariant(address, '[useFinalizeEarnWithdrawal] address is undefined');

        const successText = `Withdrawal request from Lido Earn claimed`;
        const successDescription = `Withdrawal can be processed further`;

        const { success } = await withSuccess(
          sendTX({
            successText,
            successDescription,
            flow: 'claim',
            AATitleText: successText,
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
            transactions: [
              {
                ...earnStrategy.lidoEarnStrategy.encode.finalizeRequestExit([
                  requestId,
                ]),
                signingDescription: DEFAULT_SIGNING_DESCRIPTION,
                loadingDescription: DEFAULT_LOADING_DESCRIPTION,
                loadingText: `Claiming withdrawal request from Lido Earn`,
              },
            ],
          }),
        );

        // We call invalidate here, because there is no form submission, just button
        await invalidateWrapper();

        return success;
      },
      [earnStrategy, address, sendTX, invalidateWrapper],
    ),
    ...rest,
  };
};
