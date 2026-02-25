import { useCallback } from 'react';
import type { Address, Hex } from 'viem';
import invariant from 'tiny-invariant';
import { useDefiWrapper, useInvalidateWrapper } from '@/modules/defi-wrapper';
import { useDappStatus, useSendTransaction, withSuccess } from '@/modules/web3';
import {
  DEFAULT_LOADING_DESCRIPTION,
  DEFAULT_SIGNING_DESCRIPTION,
  useTransactionModal,
} from '@/shared/components/transaction-modal';
import { formatBalance } from '@/utils/formatBalance';

type ClaimRewardParams = {
  amount: bigint;
  token: Address;
  symbol: string;
  rewardTokenDecimals: number;
  displayClaimAmount: bigint;
  proofData: readonly Hex[];
};

export const useClaimReward = () => {
  const invalidateWrapper = useInvalidateWrapper();
  const { address } = useDappStatus();
  const { wrapper, distributor } = useDefiWrapper();
  const { onTransactionStageChange } = useTransactionModal();
  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });

  const claimReward = useCallback(
    async ({
      amount,
      token,
      displayClaimAmount,
      symbol,
      proofData,
      rewardTokenDecimals,
    }: ClaimRewardParams) => {
      invariant(wrapper, '[useClaimRewards] wrapper is undefined');
      invariant(address, '[useClaimRewards] address is undefined');
      invariant(distributor, '[useClaimRewards] distributor is undefined');
      invariant(proofData, '[useClaimRewards] proof is undefined');

      const formattedAmount = formatBalance(displayClaimAmount, {
        tokenDecimals: rewardTokenDecimals,
      }).trimmed;

      const { success } = await withSuccess(
        sendTX({
          successText: `${formattedAmount} ${symbol} has been claimed`,
          AATitleText: `Claiming ${formattedAmount} ${symbol}`,
          flow: 'claim',
          AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
          AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
          transactions: [
            {
              ...distributor.encode.claim([address, token, amount, proofData]),
              loadingText: `Claiming ${formattedAmount} ${symbol}`,
              signingDescription: DEFAULT_SIGNING_DESCRIPTION,
              loadingDescription: DEFAULT_LOADING_DESCRIPTION,
            },
          ],
        }),
      );

      // We call invalidate here, because there is no form submission, just button
      if (success) await invalidateWrapper();

      return success;
    },
    [address, distributor, wrapper, sendTX, invalidateWrapper],
  );
  return {
    claimReward,
    ...rest,
  };
};
