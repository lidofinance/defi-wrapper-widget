import { useMemo } from 'react';
import {
  useRequests,
  useClaim,
  useWithdrawalQueue,
} from '@/modules/defi-wrapper';

import { useGGVBoostApy } from './use-ggv-boost-apy';
import { useGGVCancelRequest } from './use-ggv-cancel-request';
import { useGGVProcessWithdrawal } from './use-ggv-process-withdrawal';
import { useGGVRecover } from './use-ggv-recover';
import { useGGVStrategyPosition } from './use-ggv-strategy-position';

export const useStrategyWithdrawalRequestsRead = (includeBoost?: boolean) => {
  // Data fetching
  // requests to withdraw from GGV - STEP 1
  // position data - used to calcualted processable request - STEP 2
  const {
    data: ggvPosition,
    pendingGGVRequests,
    expiredGGVRequests,
    isPending: isLoadingPositionData,
  } = useGGVStrategyPosition();
  // vanilla stv pool withdrawal requests - STEP 3
  const { data: proxyRequests, isPending: isLoadingProxyRequests } =
    useRequests();

  const {
    minWithdrawalAmountInEth: minProccessableValueInEth,
    isPending: isLoadingWithdrawalQueue,
  } = useWithdrawalQueue();

  const isLoading =
    isLoadingPositionData || isLoadingProxyRequests || isLoadingWithdrawalQueue;

  const boostableStethShares =
    includeBoost && ggvPosition
      ? ggvPosition.availableMintingCapacityStethShares
      : undefined;

  const isEmpty =
    (boostableStethShares ?? 0n) === 0n &&
    (pendingGGVRequests?.length ?? 0) === 0 &&
    (expiredGGVRequests?.length ?? 0) === 0 &&
    (proxyRequests?.pending.length ?? 0) === 0 &&
    (proxyRequests?.finalized.length ?? 0) === 0 &&
    (ggvPosition?.totalEthToWithdrawFromProxy ?? 0) <= 0n &&
    (ggvPosition?.stethSharesToRecover ?? 0) <= 0n;

  return {
    isEmpty,
    isLoading,
    proxyRequests,
    ggvPosition,
    pendingGGVRequests,
    expiredGGVRequests,
    boostableStethShares,
    minProccessableValueInEth,
  };
};

export const useStrategyWithdrawalRequests = (includeBoost?: boolean) => {
  const {
    isEmpty,
    isLoading,
    proxyRequests,
    ggvPosition,
    pendingGGVRequests,
    expiredGGVRequests,
    boostableStethShares,
    minProccessableValueInEth,
  } = useStrategyWithdrawalRequestsRead(includeBoost);

  // Mutations
  const { cancelRequest, mutation: cancelRequestMutation } =
    useGGVCancelRequest();
  const { processWithdrawal, mutation: proccessWithdrawalMutation } =
    useGGVProcessWithdrawal();
  const { claim, mutation: claimMutation } = useClaim();
  const { recover, mutation: recoverMutation } = useGGVRecover();
  const { boost, mutation: boostMutation } = useGGVBoostApy();

  //
  const { processableRequest, processWithdrawalRequest } = useMemo(() => {
    const processableRequest =
      ggvPosition &&
      minProccessableValueInEth &&
      (ggvPosition.totalEthToWithdrawFromProxy > 0n ||
        ggvPosition.stethSharesToRepay > 0n)
        ? {
            stvToWithdraw: ggvPosition.totalStvToWithdrawFromProxy,
            ethToReceive: ggvPosition.totalEthToWithdrawFromProxy,
            stethSharesToRebalance: ggvPosition.stethSharesToRebalance,
            stethSharesToRepay: ggvPosition.stethSharesToRepay,
            // we can't process withdrawals below the minimum threshold
            // but if value is zero and it's just repay it's healing
            isBelowMinimumThreshold:
              ggvPosition.totalStvToWithdrawFromProxy > 0n &&
              ggvPosition.totalEthToWithdrawFromProxy <=
                minProccessableValueInEth,
            isHealing: ggvPosition.totalStvToWithdrawFromProxy <= 0n,
          }
        : undefined; // no processable request

    const processWithdrawalRequest = processableRequest
      ? () => {
          return processWithdrawal({
            stvToWithdraw: processableRequest.stvToWithdraw,
            sharesToRepay: processableRequest.stethSharesToRepay,
            sharesToRebalance: processableRequest.stethSharesToRebalance,
            ethToReceive: processableRequest.ethToReceive,
          });
        }
      : undefined;

    return { processableRequest, processWithdrawalRequest };
  }, [ggvPosition, minProccessableValueInEth, processWithdrawal]);

  const { recoverable, recoverRewards } = useMemo(() => {
    const recoverable =
      ggvPosition && ggvPosition.stethSharesToRecover > 0n
        ? {
            stethSharesToRecover: ggvPosition.stethSharesToRecover,
            recoverTokenAddress: ggvPosition.recoverTokenAddress,
          }
        : undefined;

    const recoverRewards = recoverable
      ? () => {
          return recover({
            assetToRecover: recoverable.recoverTokenAddress,
            amountToRecover: recoverable.stethSharesToRecover,
          });
        }
      : undefined;

    return { recoverable, recoverRewards };
  }, [ggvPosition, recover]);

  const { boostable, boostAPY } = useMemo(() => {
    const boostable = !!boostableStethShares && boostableStethShares > 0n;
    const boostAPY =
      boostable && boostableStethShares
        ? () => {
            return boost({ boostableStethShares });
          }
        : undefined;
    return { boostable, boostAPY };
  }, [boost, boostableStethShares]);

  const isPendingAction =
    proccessWithdrawalMutation.isPending ||
    claimMutation.isPending ||
    recoverMutation.isPending ||
    cancelRequestMutation.isPending ||
    boostMutation.isPending;

  return {
    ggvPendingRequests: pendingGGVRequests,
    ggvExpiredRequests: expiredGGVRequests,
    processableRequest,
    proxyPendingRequests: proxyRequests?.pending,
    proxyFinalizedRequests: proxyRequests?.finalized,
    processWithdrawalRequest,
    recoverable,
    recoverRewards,
    cancelRequest,
    claim,
    boostable,
    boostAPY,
    isLoading,
    isEmpty,
    isPendingAction,
  };
};
