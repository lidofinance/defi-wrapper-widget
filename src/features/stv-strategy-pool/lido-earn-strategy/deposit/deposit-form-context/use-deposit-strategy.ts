import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useStvStrategy } from '@/modules/defi-wrapper';
import { readWithReport, useReportCalls, useVault } from '@/modules/vaults';
import {
  TransactionEntry,
  useDappStatus,
  useLidoSDK,
  useSendTransaction,
  withSuccess,
} from '@/modules/web3';

import {
  DEFAULT_LOADING_DESCRIPTION,
  DEFAULT_SIGNING_DESCRIPTION,
  useTransactionModal,
} from '@/shared/components/transaction-modal';
import { getReferralAddress } from '@/shared/wrapper/refferals/get-refferal-address';
import { minBN } from '@/utils/bn';
import { formatBalance } from '@/utils/formatBalance';
import { tokenLabel } from '@/utils/token-label';
import { useEarnStrategy } from '../../hooks/use-earn-strategy';
import { encodeEarnSupplyParams } from '../../utils';
import type { DepositFormValidatedValues } from './types';

export const useDepositStrategy = () => {
  const { address } = useDappStatus();
  const { activeVault } = useVault();
  const { publicClient, core, WETH } = useLidoSDK();
  const { wrapper, strategy, dashboard } = useStvStrategy();
  const { data: earnStrategy } = useEarnStrategy();
  const { onTransactionStageChange } = useTransactionModal();

  const prepareReportCalls = useReportCalls();

  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });

  return {
    depositStrategy: useCallback(
      async ({ amount, token, referral }: DepositFormValidatedValues) => {
        invariant(wrapper, '[useDeposit] wrapper is undefined');
        invariant(address, '[useDeposit] address is undefined');
        invariant(strategy, '[useDeposit] strategy is undefined');
        invariant(dashboard, '[useDeposit] dashboard is undefined');
        invariant(earnStrategy, '[useDeposit] earnStrategy is undefined');
        const { strategyProxyAddress } = earnStrategy;
        invariant(
          strategyProxyAddress,
          '[useDeposit] strategyProxyAddress is undefined',
        );

        const wethContract = await WETH.wethContract();
        const lidoV3 = await core.getLidoContract();

        const depositedETHAmount = formatBalance(amount).actual;
        const TXTitle = `Depositing ${depositedETHAmount} ${tokenLabel('ETH')} to the vault`;
        const { success } = await withSuccess(
          sendTX({
            successText: `${depositedETHAmount} ${tokenLabel('ETH')} has been deposited to the vault`,
            AATitleText: TXTitle,
            flow: 'deposit',
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
            transactions: async () => {
              const calls: TransactionEntry[] = [];
              if (token === 'WETH') {
                calls.push({
                  ...wethContract.encode.withdraw([amount]),
                  loadingText: `Unwrapping ${tokenLabel('WETH')} to ${depositedETHAmount} ${tokenLabel('ETH')} `,
                  signingDescription: DEFAULT_SIGNING_DESCRIPTION,
                  loadingDescription: DEFAULT_LOADING_DESCRIPTION,
                });
              }

              const [proxyCapacityShares, vaultCapacityShares] =
                await readWithReport({
                  publicClient,
                  report: activeVault?.report,
                  contracts: [
                    // This can round down the shares, leaving 1n steth shares unminted
                    wrapper.prepare.remainingMintingCapacitySharesOf([
                      strategyProxyAddress,
                      amount,
                    ]),
                    dashboard.prepare.remainingMintingCapacityShares([amount]),
                  ],
                });

              const [maxMintableExternalShares, currentMintedExternalShares] =
                await Promise.all([
                  lidoV3.read.getMaxMintableExternalShares(),
                  lidoV3.read.getExternalShares(),
                ]);

              let maxMintShares = minBN(
                proxyCapacityShares,
                vaultCapacityShares,
              );

              maxMintShares = minBN(
                maxMintShares,
                maxMintableExternalShares - currentMintedExternalShares,
              );

              const reportCalls = prepareReportCalls();
              calls.push(...reportCalls);

              const referralAddress = await getReferralAddress(
                referral,
                publicClient,
              );

              calls.push({
                ...strategy.encode.supply([
                  referralAddress,
                  maxMintShares,
                  encodeEarnSupplyParams({ isSync: false, merkleProof: [] }),
                ]),
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
      [
        wrapper,
        address,
        strategy,
        dashboard,
        earnStrategy,
        WETH,
        core,
        sendTX,
        publicClient,
        activeVault?.report,
        prepareReportCalls,
      ],
    ),
    ...rest,
  };
};
