import { Button } from '@chakra-ui/react';
import { useClaimReward, useRewards } from '@/modules/defi-wrapper';
import {
  VaultInfoEntry,
  VaultInfoSection,
} from '@/shared/components/vault-info';

export const Rewards = () => {
  const { isEmpty, rewardsInfo, isLoading } = useRewards();
  const { claimReward, mutation } = useClaimReward();

  if (isEmpty || isLoading || !rewardsInfo) {
    return null;
  }

  return (
    <VaultInfoSection label="Rewards">
      {rewardsInfo.map(
        ({
          claimableAmount,
          previewClaim,
          rewardToken,
          proofData,
          rewardTokenSymbol,
          rewardTokenDecimals,
        }) => (
          <VaultInfoEntry
            key={rewardToken}
            amount={previewClaim}
            customSymbol={rewardTokenSymbol}
            customDecimals={rewardTokenDecimals}
            suffix={
              <Button
                loading={mutation.isPending}
                onClick={() =>
                  claimReward({
                    displayClaimAmount: previewClaim,
                    rewardTokenDecimals: rewardTokenDecimals,
                    amount: claimableAmount,
                    token: rewardToken,
                    symbol: rewardTokenSymbol,
                    proofData: proofData,
                  })
                }
                size={'xs'}
              >
                Claim
              </Button>
            }
          />
        ),
      )}
    </VaultInfoSection>
  );
};
