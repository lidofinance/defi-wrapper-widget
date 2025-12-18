import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useDefiWrapper, useInvalidateWrapper } from '@/modules/defi-wrapper';
import { useDappStatus, useSendTransaction, withSuccess } from '@/modules/web3';
import {
  DEFAULT_LOADING_DESCRIPTION,
  DEFAULT_SIGNING_DESCRIPTION,
  useTransactionModal,
} from '@/shared/components/transaction-modal';
import { formatBalance } from '@/utils/formatBalance';

type ClaimParams = {
  id: bigint;
  amountETH: bigint;
  checkpointHint: bigint;
};

export const useClaim = () => {
  const { address } = useDappStatus();
  const { withdrawalQueue } = useDefiWrapper();
  const invalidateWrapper = useInvalidateWrapper();
  const { onTransactionStageChange } = useTransactionModal();
  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });
  return {
    claim: useCallback(
      async ({ id, amountETH, checkpointHint }: ClaimParams) => {
        invariant(withdrawalQueue, '[useClaim] withdrawalQueue is undefined');
        invariant(address, '[useClaim] address is undefined');

        const amount = formatBalance(amountETH).actual;
        const { success } = await withSuccess(
          sendTX({
            successText: `${amount} ETH has been claimed`,
            AATitleText: `Claiming ${amount} ETH`,
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            flow: 'claim',
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
            transactions: [
              {
                ...withdrawalQueue.encode.claimWithdrawalBatch([
                  address,
                  [id],
                  [checkpointHint],
                ]),
                loadingText: `Claiming ${amount} ETH`,
                signingDescription: DEFAULT_SIGNING_DESCRIPTION,
                loadingDescription: DEFAULT_LOADING_DESCRIPTION,
              },
            ],
          }),
        );

        // We call invalidate here, because there is no form submission, just button
        if (success) await invalidateWrapper();

        return success;
      },
      [address, sendTX, invalidateWrapper, withdrawalQueue],
    ),
    ...rest,
  };
};
