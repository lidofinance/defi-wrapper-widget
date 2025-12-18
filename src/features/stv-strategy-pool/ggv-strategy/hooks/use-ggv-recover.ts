import { useCallback } from 'react';
import { Address } from 'viem';
import invariant from 'tiny-invariant';
import { useInvalidateWrapper } from '@/modules/defi-wrapper';
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
import { useGGVStrategy } from './use-ggv-strategy';

type GGVRecoverParams = {
  assetToRecover: Address;
  amountToRecover: bigint;
};

export const useGGVRecover = () => {
  const { address } = useDappStatus();
  const invalidateWrapper = useInvalidateWrapper();
  const { onTransactionStageChange } = useTransactionModal();
  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });
  const { data: ggvData } = useGGVStrategy();

  return {
    recover: useCallback(
      async ({ assetToRecover, amountToRecover }: GGVRecoverParams) => {
        invariant(ggvData, '[useGGVRecover] ggvData is undefined');
        invariant(address, '[useGGVRecover] address is undefined');

        const { ggvStrategyContract } = ggvData;

        const { success } = await withSuccess(
          sendTX({
            successText: `Claiming rewards`,
            successDescription: `Tokens have been transferred to your wallet.`,
            flow: 'claim',
            AATitleText: `Claiming rewards`,
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
            transactions: async () => {
              const calls: TransactionEntry[] = [];

              // recover ERC20
              calls.push({
                ...ggvStrategyContract.encode.recoverERC20([
                  assetToRecover,
                  address,
                  amountToRecover,
                ]),
              });

              return calls;
            },
          }),
        );

        // We call invalidate here, because there is no form submission, just button
        await invalidateWrapper();

        return success;
      },
      [address, ggvData, invalidateWrapper, sendTX],
    ),
    ...rest,
  };
};
