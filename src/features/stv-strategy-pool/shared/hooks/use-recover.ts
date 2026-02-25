import { useCallback } from 'react';
import { Address } from 'viem';
import invariant from 'tiny-invariant';
import { useInvalidateWrapper, useStvStrategy } from '@/modules/defi-wrapper';
import { useDappStatus, useSendTransaction, withSuccess } from '@/modules/web3';
import {
  DEFAULT_LOADING_DESCRIPTION,
  DEFAULT_SIGNING_DESCRIPTION,
  useTransactionModal,
} from '@/shared/components/transaction-modal';

type RecoverParams = {
  assetToRecover: Address;
  amountToRecover: bigint;
};

export const useRecover = () => {
  const { address } = useDappStatus();
  const invalidateWrapper = useInvalidateWrapper();
  const { onTransactionStageChange } = useTransactionModal();
  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });
  const { strategy } = useStvStrategy();

  return {
    recover: useCallback(
      async ({ assetToRecover, amountToRecover }: RecoverParams) => {
        invariant(strategy, '[useRecover] strategy is undefined');
        invariant(address, '[useRecover] address is undefined');

        const { success } = await withSuccess(
          sendTX({
            successText: `Claiming rewards`,
            successDescription: `Tokens have been transferred to your wallet.`,
            flow: 'claim',
            AATitleText: `Claiming rewards`,
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
            transactions: [
              strategy.encode.safeTransferERC20([
                assetToRecover,
                address,
                amountToRecover,
              ]),
            ],
          }),
        );

        // We call invalidate here, because there is no form submission, just button
        await invalidateWrapper();

        return success;
      },
      [address, strategy, invalidateWrapper, sendTX],
    ),
    ...rest,
  };
};
