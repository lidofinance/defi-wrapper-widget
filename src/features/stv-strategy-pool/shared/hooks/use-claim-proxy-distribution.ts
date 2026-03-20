import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import {
  RewardsInfoEntry,
  useInvalidateWrapper,
  useStvStrategy,
} from '@/modules/defi-wrapper';
import { useDappStatus, useSendTransaction, withSuccess } from '@/modules/web3';
import {
  DEFAULT_LOADING_DESCRIPTION,
  DEFAULT_SIGNING_DESCRIPTION,
  useTransactionModal,
} from '@/shared/components/transaction-modal';

type ClaimProxyParams = {
  claimableDistribution: RewardsInfoEntry;
};

export const useClaimProxyDistribution = () => {
  const { address } = useDappStatus();
  const invalidateWrapper = useInvalidateWrapper();
  const { onTransactionStageChange } = useTransactionModal();
  const { sendTX, ...rest } = useSendTransaction({
    callback: onTransactionStageChange,
  });
  const { strategy, distributor } = useStvStrategy();

  return {
    claimProxyDistribution: useCallback(
      async ({ claimableDistribution }: ClaimProxyParams) => {
        invariant(
          strategy,
          '[useClaimProxyDistribution] strategy is undefined',
        );
        invariant(
          distributor,
          '[useClaimProxyDistribution] distributor is undefined',
        );
        invariant(address, '[useClaimProxyDistribution] address is undefined');

        const { success } = await withSuccess(
          sendTX({
            successText: `Claiming rewards`,
            successDescription: `Tokens have been transferred to your wallet.`,
            flow: 'claim',
            AATitleText: `Claiming rewards`,
            AASigningDescription: DEFAULT_SIGNING_DESCRIPTION,
            AALoadingDescription: DEFAULT_LOADING_DESCRIPTION,
            transactions: [
              {
                ...distributor.encode.claim([
                  claimableDistribution.recipientUserAddress,
                  claimableDistribution.rewardToken,
                  claimableDistribution.claimableAmount,
                  claimableDistribution.proofData,
                ]),
                loadingText: `Claiming tokens to strategy account`,
                signingDescription: DEFAULT_SIGNING_DESCRIPTION,
                loadingDescription: DEFAULT_LOADING_DESCRIPTION,
              },
              {
                ...strategy.encode.safeTransferERC20([
                  claimableDistribution.rewardToken,
                  address,
                  claimableDistribution.previewClaim,
                ]),
                loadingText: `Transferring tokens to your account`,
                signingDescription: DEFAULT_SIGNING_DESCRIPTION,
                loadingDescription: DEFAULT_LOADING_DESCRIPTION,
              },
            ],
          }),
        );

        // We call invalidate here, because there is no form submission, just button
        await invalidateWrapper();

        return success;
      },
      [address, strategy, distributor, invalidateWrapper, sendTX],
    ),
    ...rest,
  };
};
