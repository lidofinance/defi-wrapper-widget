import { useMemo } from 'react';
import {
  useRequests,
  useClaim,
  useWithdrawalQueue,
} from '@/modules/defi-wrapper';

import {
  useBoostApy,
  useProcessWithdrawal,
  useRecover,
} from '../../shared/hooks';
import { useFinalizeEarnWithdrawal } from './use-earn-finalize-request';
import { useEarnPosition } from './use-earn-position';

export const useStrategyWithdrawalRequestsRead = (includeBoost?: boolean) => {
  // Data fetching
  // requests to withdraw from GGV - STEP 1
  // position data - used to calcualted processable request - STEP 2
  const earnPosition = useEarnPosition();
  const { isPositionLoading, positionData } = earnPosition;
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
    includeBoost && positionData?.availableMintingCapacityStethShares
      ? positionData.availableMintingCapacityStethShares
      : undefined;

  const isEmpty =
    (boostableStethShares ?? 0n) === 0n &&
    (positionData?.withdrawalRequests?.length ?? 0) === 0 &&
    (proxyRequests?.pending.length ?? 0) === 0 &&
    (proxyRequests?.finalized.length ?? 0) === 0 &&
    (positionData?.totalEthToWithdrawFromProxy ?? 0) <= 0n &&
    (positionData?.stethSharesToRecover ?? 0) <= 0n;

  return {
    isEmpty,
    isLoading,
    proxyRequests,
    positionData,
    withdrawalRequests: positionData?.withdrawalRequests,
    boostableStethShares,
    minProccessableValueInEth,
  };
};

export const useStrategyWithdrawalRequests = (includeBoost?: boolean) => {
  const {
    isEmpty,
    isLoading,
    proxyRequests,
    positionData,
    withdrawalRequests,
    boostableStethShares,
    minProccessableValueInEth,
  } = useStrategyWithdrawalRequestsRead(includeBoost);

  // Mutations

  const { claim, mutation: claimMutation } = useClaim();
  const { processWithdrawal, mutation: proccessWithdrawalMutation } =
    useProcessWithdrawal();
  const { recover, mutation: recoverMutation } = useRecover();
  const { boost, mutation: boostMutation } = useBoostApy();
  const {
    finalizeEarnWithdrawal: claimEarnWithdrawal,
    mutation: finalizeEarnWithdrawalMutation,
  } = useFinalizeEarnWithdrawal();

  // Earn withdrawal claim
  // TODO: merge smartly into processable request
  const { pendingEarnRequests, claimableEarnRequests } = useMemo(() => {
    return {
      pendingEarnRequests: withdrawalRequests?.filter(
        (request) => !request.isClaimable,
      ),
      claimableEarnRequests: withdrawalRequests?.filter(
        (request) => request.isClaimable,
      ),
    };
  }, [withdrawalRequests]);

  //
  const { processableRequest, processWithdrawalRequest } = useMemo(() => {
    const request =
      positionData &&
      minProccessableValueInEth &&
      (positionData.totalEthToWithdrawFromProxy > 0n ||
        positionData.stethSharesToRepay > 0n)
        ? {
            stvToWithdraw: positionData.totalStvToWithdrawFromProxy,
            ethToReceive: positionData.totalEthToWithdrawFromProxy,
            stethSharesToRebalance: positionData.stethSharesToRebalance,
            stethSharesToRepay: positionData.stethSharesToRepay,
            // we can't process withdrawals below the minimum threshold
            // but if value is zero and it's just repay it's healing
            isBelowMinimumThreshold:
              positionData.totalStvToWithdrawFromProxy > 0n &&
              positionData.totalEthToWithdrawFromProxy <=
                minProccessableValueInEth,
            isHealing: positionData.totalStvToWithdrawFromProxy <= 0n,
          }
        : undefined; // no processable request

    return {
      processableRequest: request,
      processWithdrawalRequest: request
        ? () => {
            return processWithdrawal({
              stvToWithdraw: request.stvToWithdraw,
              sharesToRepay: request.stethSharesToRepay,
              sharesToRebalance: request.stethSharesToRebalance,
              ethToReceive: request.ethToReceive,
            });
          }
        : undefined,
    };
  }, [positionData, minProccessableValueInEth, processWithdrawal]);

  const { recoverable, recoverRewards } = useMemo(() => {
    const recoverablePosition =
      positionData && positionData.stethSharesToRecover > 0n
        ? {
            stethSharesToRecover: positionData.stethSharesToRecover,
            recoverTokenAddress: positionData.recoverTokenAddress,
          }
        : undefined;
    return {
      recoverable: recoverablePosition,

      recoverRewards:
        recoverablePosition && positionData
          ? () => {
              return recover({
                assetToRecover: recoverablePosition.recoverTokenAddress,
                amountToRecover: recoverablePosition.stethSharesToRecover,
              });
            }
          : undefined,
    };
  }, [positionData, recover]);

  const { boostable, boostAPY } = useMemo(() => {
    const isBoostable = !!boostableStethShares && boostableStethShares > 0n;
    return {
      boostable: isBoostable,
      boostAPY:
        isBoostable && boostableStethShares
          ? () => {
              return boost({ boostableStethShares });
            }
          : undefined,
    };
  }, [boost, boostableStethShares]);

  const isPendingAction =
    proccessWithdrawalMutation.isPending ||
    claimMutation.isPending ||
    recoverMutation.isPending ||
    boostMutation.isPending ||
    finalizeEarnWithdrawalMutation.isPending;

  return {
    // Earn vault withdrawal
    pendingEarnRequests,
    claimableEarnRequests,
    claimEarnWithdrawal,

    // request of native withdraws/repayments from pool
    processableRequest,
    processWithdrawalRequest,

    proxyPendingRequests: proxyRequests?.pending,
    // claiming from proxy
    proxyFinalizedRequests: proxyRequests?.finalized,
    claim,

    // recoverable rewards
    recoverable,
    recoverRewards,

    // apy boost
    boostable,
    boostAPY,

    isLoading,
    isEmpty,
    isPendingAction,
  };
};
