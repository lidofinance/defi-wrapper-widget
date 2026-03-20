import { Presence } from '@chakra-ui/react';
import { useRequests, useRewards } from '@/modules/defi-wrapper';
import { Rewards } from '@/shared/components/rewards/rewards';
import { VaultInfo } from '@/shared/components/vault-info';
import { Mint } from './mint';
import { useAvailableMint } from './mint/use-available-mint';
import { WithdrawalRequests } from './withdrawal-requests';

type VaultStatusProps = {
  showMint?: boolean;
  showWithdrawalRequests?: boolean;
  showRewards?: boolean;
};

export const VaultStatus = ({
  showMint = false,
  showWithdrawalRequests = false,
  showRewards = false,
}: VaultStatusProps) => {
  const { data: mintData, isLoading: isMintLoading } = useAvailableMint();
  const { data: requests, isLoading: isRequestsLoading } = useRequests();
  const { data: rewardsData } = useRewards();
  const isLoading = isMintLoading || isRequestsLoading;

  const shouldShowMint =
    showMint && (mintData?.totalMintedSteth || mintData?.mintableSteth);

  const shouldShowWithdrawalRequests =
    showWithdrawalRequests &&
    !isRequestsLoading &&
    !!requests &&
    !requests.isEmpty;

  const shouldShowRewards = showRewards && !!rewardsData?.isEmpty;

  const shouldShowStatus =
    shouldShowWithdrawalRequests || shouldShowMint || shouldShowRewards;

  if (isLoading || !shouldShowStatus) {
    return null;
  }

  return (
    <Presence
      present
      animationName={{ _open: 'fade-in', _closed: 'fade-out' }}
      animationDuration="moderate"
    >
      <VaultInfo>
        {showMint && <Mint />}
        {showWithdrawalRequests && <WithdrawalRequests />}
        {showRewards && <Rewards />}
      </VaultInfo>
    </Presence>
  );
};
