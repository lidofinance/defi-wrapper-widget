//import { useMemo } from 'react';
import {
  useRequests,
  //useClaim,
  useWithdrawalQueue,
} from '@/modules/defi-wrapper';

// import { useGGVBoostApy } from './use-ggv-boost-apy';
// import { useGGVCancelRequest } from './use-ggv-cancel-request';
// import { useGGVProcessWithdrawal } from './use-ggv-process-withdrawal';
// import { useGGVRecover } from './use-ggv-recover';
import { useEarnPosition } from './use-earn-position';

export const useStrategyWithdrawalRequestsRead = (includeBoost?: boolean) => {
  // Data fetching
  // requests to withdraw from GGV - STEP 1
  // position data - used to calcualted processable request - STEP 2
  const earnPosition = useEarnPosition();
  const {
    isPositionLoading,
    availableMintingCapacityStethShares,
    withdrawalRequests,
    totalEthToWithdrawFromProxy,
    stethSharesToRecover,
  } = earnPosition;
  // vanilla stv pool withdrawal requests - STEP 3
  const { data: proxyRequests, isPending: isLoadingProxyRequests } =
    useRequests();

  const {
    minWithdrawalAmountInEth: minProccessableValueInEth,
    isPending: isLoadingWithdrawalQueue,
  } = useWithdrawalQueue();

  const isLoading =
    isPositionLoading || isLoadingProxyRequests || isLoadingWithdrawalQueue;

  const boostableStethShares =
    includeBoost && availableMintingCapacityStethShares
      ? availableMintingCapacityStethShares
      : undefined;

  const isEmpty =
    (boostableStethShares ?? 0n) === 0n &&
    (withdrawalRequests?.length ?? 0) === 0 &&
    (proxyRequests?.pending.length ?? 0) === 0 &&
    (proxyRequests?.finalized.length ?? 0) === 0 &&
    (totalEthToWithdrawFromProxy ?? 0) <= 0n &&
    (stethSharesToRecover ?? 0) <= 0n;

  return {
    isEmpty,
    isLoading,
    proxyRequests,
    earnPosition,
    withdrawalRequests,
    boostableStethShares,
    minProccessableValueInEth,
  };
};
