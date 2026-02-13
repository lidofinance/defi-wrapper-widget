import { useCallback } from 'react';
import { Address } from 'viem';
import invariant from 'tiny-invariant';
import { useInvalidateWrapper } from '@/modules/defi-wrapper';
import {
  TransactionEntry,
  useSendTransaction,
  withSuccess,
} from '@/modules/web3';
import {
  DEFAULT_LOADING_DESCRIPTION,
  DEFAULT_SIGNING_DESCRIPTION,
  useTransactionModal,
} from '@/shared/components/transaction-modal';

import { useGGVStrategy } from './use-ggv-strategy';
import type { GGVWithdrawalRequestMetatadata } from './use-ggv-withdrawal-requests';

type GGVCancelRequestParams = {
  requestMetadata: GGVWithdrawalRequestMetatadata;
};

export const useGGVCancelRequest = () => {
  const invalidateWrapper = useInvalidateWrapper();
  const { data: ggvData } = useGGVStrategy();
  const { onTransactionStageChange } = useTransactionModal();

  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });

  return {
    cancelRequest: useCallback(
      async ({ requestMetadata }: GGVCancelRequestParams) => {
        invariant(ggvData, '[useWithdrawal] ggvData is undefined');

        const { ggvStrategyContract } = ggvData;

        const { success } = await withSuccess(
          sendTX({
            successText: `Funds are returned to the strategy.`,
            successDescription: `Cancelled strategy withdrawal request successfully.`,
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
            flow: 'claim',
            transactions: [
              {
                ...ggvStrategyContract.encode.cancelGGVOnChainWithdraw([
                  {
                    nonce: BigInt(requestMetadata.nonce),
                    amountOfAssets: BigInt(requestMetadata.amountOfAssets),
                    amountOfShares: BigInt(requestMetadata.amountOfShares),
                    assetOut: requestMetadata.assetOut as Address,
                    user: requestMetadata.user as Address,
                    secondsToDeadline: Number(
                      requestMetadata.secondsToDeadline,
                    ),
                    secondsToMaturity: Number(
                      requestMetadata.secondsToMaturity,
                    ),
                    creationTime: Number(requestMetadata.creationTime),
                  },
                ]),
                loadingText: `Cancelling strategy withdrawal request`,
                signingDescription: DEFAULT_SIGNING_DESCRIPTION,
                loadingDescription: DEFAULT_LOADING_DESCRIPTION,
              },
            ],
          }),
        );

        if (success) {
          await invalidateWrapper();
        }

        return success;
      },
      [ggvData, sendTX, invalidateWrapper],
    ),
    ...rest,
  };
};
