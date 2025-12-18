import { Presence } from '@chakra-ui/react';
import { useRequests } from '@/modules/defi-wrapper/hooks/use-requests';
import { VaultInfo } from '@/shared/components/vault-info';
import { Mint } from './mint';
import { useAvailableMint } from './mint/use-available-mint';
import { WithdrawalRequests } from './withdrawal-requests';

export const VaultStatus = ({
  showMint = false,
  showWithdrawalRequests = false,
}: {
  showMint?: boolean;
  showWithdrawalRequests?: boolean;
}) => {
  const { data: mintData, isLoading: isMintLoading } = useAvailableMint();
  const { data: requests, isLoading: isRequestsLoading } = useRequests();
  const isLoading = isMintLoading || isRequestsLoading;

  const shouldShowMint =
    showMint && (mintData?.totalMintedSteth || mintData?.mintableSteth);

  const shouldShowWithdrawalRequests =
    showWithdrawalRequests &&
    !isRequestsLoading &&
    !!requests &&
    !requests.isEmpty;

  const shouldShowStatus = shouldShowWithdrawalRequests || shouldShowMint;

  if (isLoading || !shouldShowStatus) {
    return null;
  }

  return (
    <Presence
      present={true}
      animationName={{ _open: 'fade-in', _closed: 'fade-out' }}
      animationDuration="moderate"
    >
      <VaultInfo>
        {showMint && <Mint />}
        {showWithdrawalRequests && <WithdrawalRequests />}
      </VaultInfo>
    </Presence>
  );
};
