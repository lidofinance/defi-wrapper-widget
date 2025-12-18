import { useRequests, useClaim } from '@/modules/defi-wrapper';
import {
  FinalizedRequests,
  PendingRequests,
} from '@/shared/components/withdrawal-requests';

export const WithdrawalRequests = () => {
  const { data: requests } = useRequests();
  const { claim, mutation } = useClaim();

  const pendingRequests = requests?.pending || [];
  const finalizedRequests = requests?.finalized || [];

  if (pendingRequests.length === 0 && finalizedRequests.length === 0) {
    return null;
  }

  return (
    <>
      <PendingRequests requests={pendingRequests} />
      <FinalizedRequests
        requests={finalizedRequests}
        onClaim={({ id, amountOfAssets, checkpointHint }) =>
          claim({ id, amountETH: amountOfAssets, checkpointHint })
        }
        isClaimLoading={mutation.isPending}
      />
    </>
  );
};
