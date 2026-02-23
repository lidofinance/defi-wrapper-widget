import { useCallback } from 'react';
import { usePublicClient } from 'wagmi';
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
import { getQueryStringVal } from '@/shared/hooks/use-query-values-form';
import { getReferralAddress } from '@/shared/wrapper/refferals/get-refferal-address';

type BoostAprParams = {
  boostableStethShares: bigint;
};

export const useBoostApy = () => {
  const { address } = useDappStatus();
  const publicClient = usePublicClient();
  const invalidateWrapper = useInvalidateWrapper();
  const { onTransactionStageChange } = useTransactionModal();
  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });
  const prepareReportCalls = useReportCalls();
  const { strategy } = useStvStrategy();

  return {
    boost: useCallback(
      async ({ boostableStethShares }: BoostAprParams) => {
        invariant(strategy, '[useBoostApy] strategy is undefined');
        invariant(address, '[useBoostApy] address is undefined');

        const { success } = await withSuccess(
          sendTX({
            successText: `Your APY has been boosted successfully.`,
            successDescription: `You have boosted your Strategy Vault APY.`,
            flow: 'claim',
            AATitleText: 'Boosting Strategy Vault APY.',
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
            transactions: async () => {
              const calls: TransactionEntry[] = [];
              const reportCalls = await prepareReportCalls();
              // report
              calls.push(...reportCalls);

              const referralAddress = await getReferralAddress(
                getQueryStringVal('ref'),
                publicClient,
              );

              calls.push({
                ...strategy.encode.supply([
                  referralAddress,
                  boostableStethShares,
                  '0x',
                ]),
                loadingText: 'Boosting Strategy Vault APY.',
                signingDescription: DEFAULT_SIGNING_DESCRIPTION,
                loadingDescription: DEFAULT_LOADING_DESCRIPTION,
              });

              return calls;
            },
          }),
        );

        // We call invalidate here, because there is no form submission, just button
        await invalidateWrapper();

        return success;
      },
      [
        address,
        strategy,
        invalidateWrapper,
        prepareReportCalls,
        publicClient,
        sendTX,
      ],
    ),
    ...rest,
  };
};
