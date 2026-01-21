import { useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';
import { useStvStrategy } from '@/modules/defi-wrapper';
import {
  getWethContract,
  getLidoV3Contract,
  readWithReport,
  useReportCalls,
  useVault,
} from '@/modules/vaults';
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
import { minBN } from '@/utils/bn';
import { formatBalance } from '@/utils/formatBalance';
import { tokenLabel } from '@/utils/token-label';
import { useGGVStrategy } from '../../hooks/use-ggv-strategy';
import { encodeGGVDepositParams } from '../../utils';
import type { DepositFormValidatedValues } from './types';

const GGV_PARAMS_DEPOSIT = encodeGGVDepositParams({
  minimumMint: 0,
});

export const useDepositStrategy = () => {
  const { address } = useDappStatus();
  const publicClient = usePublicClient();
  const { activeVault } = useVault();
  const { wrapper, strategy, dashboard } = useStvStrategy();
  const { data: ggvStrategy } = useGGVStrategy();
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
        invariant(ggvStrategy, '[useDeposit] ggvStrategy is undefined');
        const { strategyProxyAddress } = ggvStrategy;
        invariant(
          strategyProxyAddress,
          '[useDeposit] strategyProxyAddress is undefined',
        );

        const wethContract = getWethContract(publicClient);
        const lidoV3 = getLidoV3Contract(publicClient);

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

              // TODO: check for roudning issues overstepping max minting capacity by 1 wei
              let maxMintShares = minBN(
                proxyCapacityShares,
                vaultCapacityShares,
              );

              maxMintShares = minBN(
                maxMintShares,
                maxMintableExternalShares - currentMintedExternalShares,
              );

              const reportCalls = await prepareReportCalls();
              calls.push(...reportCalls);

              const referralAddress = await getReferralAddress(
                referral,
                publicClient,
              );

              calls.push({
                ...strategy.encode.supply([
                  referralAddress,
                  maxMintShares,
                  GGV_PARAMS_DEPOSIT,
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
        activeVault,
        ggvStrategy,
        address,
        prepareReportCalls,
        publicClient,
        sendTX,
        dashboard,
        strategy,
        wrapper,
      ],
    ),
    ...rest,
  };
};
