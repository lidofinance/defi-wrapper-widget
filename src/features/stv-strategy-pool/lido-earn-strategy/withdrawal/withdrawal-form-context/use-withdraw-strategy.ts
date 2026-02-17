import { useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';
import { useStvStrategy } from '@/modules/defi-wrapper';
import { useVault, readWithReport } from '@/modules/vaults';
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
import { useEarnStrategy } from '../../hooks';

import type { WithdrawalFormValidatedValues } from './types';

export const useWithdrawStrategy = () => {
  const { address } = useDappStatus();
  const publicClient = usePublicClient();
  const { activeVault } = useVault();
  const { wrapper } = useStvStrategy();
  const { data: earnStrategy } = useEarnStrategy();
  const { onTransactionStageChange } = useTransactionModal();

  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });

  return {
    withdrawStrategy: useCallback(
      async ({ amount }: WithdrawalFormValidatedValues) => {
        invariant(earnStrategy, '[useWithdrawal] earnStrategy is undefined');
        invariant(address, '[useWithdrawal] address is undefined');
        invariant(activeVault, '[useWithdrawal] activeVault is undefined');

        const { lidoEarnStrategy } = earnStrategy;

        const requestedETHAmount = formatBalance(amount).actual;

        const { success } = await withSuccess(
          sendTX({
            successText: `${requestedETHAmount} ${tokenLabel('ETH')} has been requested`,
            successDescription: `Lido Earn ETH will be withdrawing the requested amount for up 5 days. After that you will be able to process your withdrawal further.`,
            AATitleText: `${requestedETHAmount} ${tokenLabel('ETH')} has been requested`,
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
            flow: 'withdrawal',
            transactions: async () => {
              const calls: TransactionEntry[] = [];

              // amount is ETH of total eth value

              // calculate how much stETH should be returned from strategy to proxy
              const [stethSharesToWithdraw] = await readWithReport({
                contracts: [
                  wrapper.prepare.calcStethSharesToMintForAssets([amount]),
                ],
                report: activeVault.report,
                publicClient,
              });

              calls.push({
                ...lidoEarnStrategy.encode.requestExitByWsteth([
                  stethSharesToWithdraw,
                  '0x',
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
      [activeVault, earnStrategy, address, wrapper, publicClient, sendTX],
    ),
    ...rest,
  };
};
