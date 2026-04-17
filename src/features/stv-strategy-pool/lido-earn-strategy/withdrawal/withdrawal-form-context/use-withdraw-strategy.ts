import { useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';
import { useStvStrategy } from '@/modules/defi-wrapper';
import { useVault, readWithReport } from '@/modules/vaults';
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
import { clampZeroBN, minBN } from '@/utils/bn';
import { formatBalance } from '@/utils/formatBalance';
import { tokenLabel } from '@/utils/token-label';
import { useEarnPosition, useEarnStrategy } from '../../hooks';

import type { WithdrawalFormValidatedValues } from './types';

export const useWithdrawStrategy = () => {
  const { positionData } = useEarnPosition();
  const { address } = useDappStatus();
  const publicClient = usePublicClient();
  const { activeVault } = useVault();
  const { shares } = useLidoSDK();
  const { wrapper } = useStvStrategy();
  const { data: earnStrategy } = useEarnStrategy();
  const { onTransactionStageChange } = useTransactionModal();

  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });

  return {
    withdrawStrategy: useCallback(
      async ({ amount }: WithdrawalFormValidatedValues) => {
        invariant(
          earnStrategy,
          '[useWithdrawStrategy] earnStrategy is undefined',
        );
        invariant(address, '[useWithdrawStrategy] address is undefined');
        invariant(
          activeVault,
          '[useWithdrawStrategy] activeVault is undefined',
        );
        invariant(
          positionData,
          '[useWithdrawStrategy] positionData is undefined',
        );

        const { lidoEarnStrategy, strategyProxyAddress } = earnStrategy;

        invariant(
          strategyProxyAddress,
          '[useWithdrawStrategy] strategyProxyAddress is undefined',
        );

        const requestedETHAmount = formatBalance(amount).actual;

        const { success } = await withSuccess(
          sendTX({
            successText: `${requestedETHAmount} ${tokenLabel('ETH')} has been requested`,
            successDescription: `Lido Earn ETH will be withdrawing the requested amount for up to 5 days. After that you will be able to process your withdrawal further.`,
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
            flow: 'withdrawal',
            transactions: async () => {
              const calls: TransactionEntry[] = [];

              const claimable = await lidoEarnStrategy.read.claimableSharesOf([
                address,
              ]);

              if (claimable > 0n) {
                calls.push({
                  ...lidoEarnStrategy.encode.claimShares(),
                  loadingText: `Unlocking Lido Earn ETH shares for withdrawal`,
                  signingDescription: DEFAULT_SIGNING_DESCRIPTION,
                  loadingDescription: DEFAULT_LOADING_DESCRIPTION,
                });
              }

              // We need to convert ETH withdrawal value -> liability wstETH
              // But ETH strategy withdrawable amount consists of two parts:
              //  - unlocked eth (by repaying liability and calculated by RR and calcAssetsToLockForMintStethShares )
              //  - excess steth (calculated from strategy balance above liabilities and calculated to eth as stETH<>Wsteth lido rate)
              // this is not linear conversion and we need to first try to withdraw excess and then only liability part
              //
              // Example:
              //
              // [min:0------[USER INPUT]----------------------------------------------------------------------------------------max]
              //                 |
              //                \_/
              //
              // [ --- EXCESS ETH ---- ] | [ ---------------------------------- ETH TO PAY FOR LIABILITY -------------------------- ]
              //          |                                        |
              //    <1:1 lido ratio>                    <calculated by RR and calcAssetsToLockForMintStethShares>
              //          |                                        |
              // [ --- EXCESS STETH ---] | [ ------------- LIABILITY (WSTETH) ---------- ]
              //

              const ethToPayForLiability = clampZeroBN(
                amount - positionData.strategyVaultStethExcess,
              );

              const stethToWithdrawForExcess = clampZeroBN(
                amount - ethToPayForLiability,
              );

              const stethSharesToWithdrawForExcess =
                await shares.convertToShares(stethToWithdrawForExcess);

              // calculate how much stETH should be returned from strategy to proxy
              const [stethSharesToWithdrawToPayForLiability] =
                await readWithReport({
                  contracts: [
                    wrapper.prepare.calcStethSharesToMintForAssets([
                      ethToPayForLiability,
                    ]),
                  ],
                  report: activeVault.report,
                  publicClient,
                });

              const stethSharesToWithdraw = minBN(
                stethSharesToWithdrawToPayForLiability +
                  stethSharesToWithdrawForExcess,
                positionData.strategyStethSharesBalance,
              );

              // Guard: strategyStethSharesBalance can be 0 if position is empty, producing stethSharesToWithdraw=0
              if (stethSharesToWithdraw > 0n) {
                calls.push({
                  ...lidoEarnStrategy.encode.requestExitByWsteth([
                    stethSharesToWithdraw,
                    '0x',
                  ]),
                  loadingText: `Requesting ${requestedETHAmount} ${tokenLabel('ETH')} from the Lido Earn ETH`,
                  signingDescription: DEFAULT_SIGNING_DESCRIPTION,
                  loadingDescription: DEFAULT_LOADING_DESCRIPTION,
                });
              }

              return calls;
            },
          }),
        );

        return success;
      },
      [
        earnStrategy,
        address,
        activeVault,
        positionData,
        sendTX,
        shares,
        wrapper.prepare,
        publicClient,
      ],
    ),
    ...rest,
  };
};
