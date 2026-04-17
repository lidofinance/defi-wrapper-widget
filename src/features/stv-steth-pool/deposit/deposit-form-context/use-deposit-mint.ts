import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useStvSteth } from '@/modules/defi-wrapper';
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
import { Token } from '@/types/token';
import { clampZeroBN, minBN } from '@/utils/bn';
import { formatBalance } from '@/utils/formatBalance';
import { tokenLabel } from '@/utils/token-label';
import type { DepositFormValidatedValues } from './types';

const createTxMetadata = (loadingText: string) => ({
  signingDescription: DEFAULT_SIGNING_DESCRIPTION,
  loadingDescription: DEFAULT_LOADING_DESCRIPTION,
  loadingText,
});

const combineTxTitles = ({
  depositedAmount,
  token,
  mintedAmountBalance,
  tokenToMint,
}: {
  depositedAmount: string;
  token: Token;
  mintedAmountBalance?: string;
  tokenToMint: Extract<Token, 'WSTETH' | 'STETH'>;
}) => {
  if (mintedAmountBalance) {
    return `Depositing ${depositedAmount} ${tokenLabel(token)} to the vault and minting ${
      mintedAmountBalance
    } ${tokenLabel(tokenToMint)}`;
  }

  return `Depositing ${depositedAmount} ${tokenLabel(token)} to the vault`;
};

export const useDepositMint = () => {
  const { address } = useDappStatus();
  const { shares, core, WETH, publicClient } = useLidoSDK();
  const { activeVault } = useVault();
  const { wrapper, dashboard, mintingPaused } = useStvSteth();
  const { onTransactionStageChange } = useTransactionModal();

  const prepareReportCalls = useReportCalls();

  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });

  return {
    deposit: useCallback(
      async ({
        amount,
        token,
        referral,
        tokenToMint,
      }: DepositFormValidatedValues) => {
        invariant(wrapper, '[useDeposit] wrapper is undefined');
        invariant(address, '[useDeposit] address is undefined');
        invariant(dashboard, '[useDeposit] dashboard is undefined');
        const wethContract = await WETH.wethContract();
        const lidoV3 = await core.getLidoContract();
        const depositedAmount = formatBalance(amount).actual;

        const TXTitle = combineTxTitles({
          depositedAmount,
          token,
          tokenToMint,
        });

        const { success } = await withSuccess(
          sendTX({
            successText: `${depositedAmount} ${tokenLabel(token)} has been deposited to the vault`,
            AATitleText: TXTitle,
            flow: 'deposit',
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
            // Capacity reads are inside transactions so values are fresh at signing time,
            // not stale from button-click under AA wallet delays or network congestion.
            transactions: async () => {
              const calls: TransactionEntry[] = [];

              if (token === 'WETH') {
                calls.push({
                  ...wethContract.encode.withdraw([amount]),
                  ...createTxMetadata(
                    `Unwrapping ${depositedAmount} ${tokenLabel('WETH')} into ${depositedAmount} ${tokenLabel('ETH')}`,
                  ),
                });
              }

              const reportCalls = prepareReportCalls();
              calls.push(...reportCalls);

              let maxMintShares: bigint;
              let mintedAmountBalance: string | undefined = undefined;

              if (mintingPaused) {
                maxMintShares = 0n;
              } else {
                const [
                  remainingUserMintingCapacityShares,
                  remainingVaultMintingCapacityShares,
                  maxMintableExternalShares,
                  currentMintedExternalShares,
                ] = await readWithReport({
                  publicClient,
                  report: activeVault?.report,
                  contracts: [
                    wrapper.prepare.remainingMintingCapacitySharesOf([
                      address,
                      amount,
                    ]),
                    dashboard.prepare.remainingMintingCapacityShares([amount]),
                    // not dependant on report but benefit from batch
                    lidoV3.prepare.getMaxMintableExternalShares(),
                    lidoV3.prepare.getExternalShares(),
                  ],
                });

                // Subtract 1n to absorb the known 1-wei floor rounding in remainingMintingCapacitySharesOf;
                // clamp to 0n so capacity=0 doesn't produce a negative mint amount
                maxMintShares = clampZeroBN(
                  minBN(
                    remainingUserMintingCapacityShares,
                    remainingVaultMintingCapacityShares,
                    maxMintableExternalShares - currentMintedExternalShares,
                  ) - 1n,
                );

                const maxMintSteth = await shares.convertToSteth(maxMintShares);

                mintedAmountBalance =
                  tokenToMint === 'STETH'
                    ? formatBalance(maxMintSteth).actual
                    : formatBalance(maxMintShares).actual;
              }

              const referralAddress = await getReferralAddress(
                referral,
                publicClient,
              );

              // Add deposit and mint transaction based on token type
              const depositMethod =
                tokenToMint === 'STETH'
                  ? wrapper.encode.depositETHAndMintStethShares
                  : wrapper.encode.depositETHAndMintWsteth;

              calls.push({
                ...depositMethod([referralAddress, maxMintShares]),
                value: amount,
                ...createTxMetadata(
                  combineTxTitles({
                    depositedAmount,
                    token: 'ETH',
                    mintedAmountBalance,
                    tokenToMint,
                  }),
                ),
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
        dashboard,
        WETH,
        core,
        mintingPaused,
        sendTX,
        publicClient,
        activeVault?.report,
        shares,
        prepareReportCalls,
      ],
    ),
    ...rest,
  };
};
