import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useInvalidateWrapper, useStvSteth } from '@/modules/defi-wrapper';
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
import { MINT_TOKENS_VALUE_TYPE } from '@/shared/hook-form/validation';
import { formatBalance } from '@/utils/formatBalance';
import { tokenLabel } from '@/utils/token-label';

type MintRequestParams = {
  tokenAmount: bigint;
  token: MINT_TOKENS_VALUE_TYPE;
  stethSharesToMint: bigint;
};

export const useMintRequest = () => {
  const invalidateWrapper = useInvalidateWrapper();
  const { address } = useDappStatus();
  const { wrapper } = useStvSteth();
  const { onTransactionStageChange } = useTransactionModal();
  const prepareReportCalls = useReportCalls();

  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });

  const mint = useCallback(
    async ({ tokenAmount, token, stethSharesToMint }: MintRequestParams) => {
      invariant(wrapper, '[useMint] wrapper is undefined');
      invariant(address, '[useMint] address is undefined');

      const formattedAmount = formatBalance(tokenAmount).trimmed;

      const label = tokenLabel(token);

      const { success } = await withSuccess(
        sendTX({
          successText: `${formattedAmount} ${label} has been minter`,
          AATitleText: `Minting ${formattedAmount} ${label}`,
          flow: 'mint',
          AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
          AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
          transactions: async () => {
            const calls: TransactionEntry[] = [];
            const reportCalls = await prepareReportCalls();
            calls.push(...reportCalls);

            const mintMethod =
              token === 'STETH'
                ? ('mintStethShares' as const)
                : ('mintWsteth' as const);

            calls.push({
              ...wrapper.encode[mintMethod]([stethSharesToMint]),
              loadingText: `Minting ${formattedAmount} ${label}`,
              signingDescription: DEFAULT_SIGNING_DESCRIPTION,
              loadingDescription: DEFAULT_LOADING_DESCRIPTION,
            });

            return calls;
          },
        }),
      );

      // We call invalidate here, because there is no form submission, just button
      if (success) await invalidateWrapper();

      return success;
    },
    [address, prepareReportCalls, wrapper, sendTX, invalidateWrapper],
  );
  return {
    mint,
    ...rest,
  };
};
