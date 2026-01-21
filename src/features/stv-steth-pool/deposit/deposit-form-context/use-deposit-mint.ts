import { useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';
import { useStvSteth } from '@/modules/defi-wrapper';
import {
  getWethContract,
  readWithReport,
  useReportCalls,
  useVault,
  getLidoV3Contract,
} from '@/modules/vaults';
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
import type { DepositFormValidatedValues } from './types';

const createTxMetadata = (loadingText: string) => ({
  signingDescription: DEFAULT_SIGNING_DESCRIPTION,
  loadingDescription: DEFAULT_LOADING_DESCRIPTION,
  loadingText,
});

export const useDepositMint = () => {
  const { address } = useDappStatus();
  const publicClient = usePublicClient();
  const { shares } = useLidoSDK();
  const { activeVault } = useVault();
  const { wrapper, dashboard } = useStvSteth();
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
        const wethContract = getWethContract(publicClient);
        const lidoV3 = getLidoV3Contract(publicClient);

        const [
          remainingUserMintingCapacityShares,
          remainingVaultMintingCapacityShares,
        ] = await readWithReport({
          publicClient,
          report: activeVault?.report,
          contracts: [
            wrapper.prepare.remainingMintingCapacitySharesOf([address, amount]),
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
          remainingUserMintingCapacityShares,
          remainingVaultMintingCapacityShares,
        );

        maxMintShares = minBN(
          maxMintShares,
          maxMintableExternalShares - currentMintedExternalShares,
        );

        const maxMintSteth = await shares.convertToSteth(maxMintShares);

        const depositedAmount = formatBalance(amount).actual;

        const mintedAmountBalance =
          tokenToMint === 'STETH'
            ? formatBalance(maxMintSteth).actual
            : formatBalance(maxMintShares).actual;

        const TXTitle = `Depositing ${depositedAmount} ${tokenLabel(token)} to the vault and minting ${
          mintedAmountBalance
        } ${tokenLabel(tokenToMint)}`;

        const { success } = await withSuccess(
          sendTX({
            successText: `${depositedAmount} ${tokenLabel(token)} has been deposited to the vault`,
            AATitleText: TXTitle,
            flow: 'deposit',
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
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

              const reportCalls = await prepareReportCalls();
              calls.push(...reportCalls);

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
                ...depositMethod([
                  referralAddress, // referral
                  maxMintShares, // max mint shares
                ]),
                value: amount,
                ...createTxMetadata(TXTitle),
              });

              return calls;
            },
          }),
        );

        return success;
      },
      [
        activeVault,
        prepareReportCalls,
        publicClient,
        dashboard,
        shares,
        wrapper,
        sendTX,
        address,
      ],
    ),
    ...rest,
  };
};
