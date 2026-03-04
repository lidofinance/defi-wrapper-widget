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

const canProcessRequest = (
  positionData: ReturnType<typeof useEarnPosition>['positionData'],
  minProccessableValueInEth: bigint | undefined,
) => {
  if (!positionData) return false;

  if (typeof minProccessableValueInEth === 'undefined') return false;

  if (positionData.totalEthToWithdrawFromProxy > 0n) {
    return (
      positionData.totalEthToWithdrawFromProxy -
        positionData.stethToRebalance >=
      minProccessableValueInEth
    );
  } else {
    return positionData.stethSharesToRepay > 0n;
  }
};

const canBoost = (boostableStethShares: bigint | undefined) => {
  return !!boostableStethShares && boostableStethShares > 100n;
};

const canRecover = (
  positionData: ReturnType<typeof useEarnPosition>['positionData'],
) => {
  if (!positionData) return false;

  return positionData.stethSharesToRecover > 0n;
};

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
    minWithdrawalAmountInEth: minProcessableValueInEth,
    isPending: isLoadingWithdrawalQueue,
  } = useWithdrawalQueue();

  const isLoading =
    isPositionLoading || isLoadingProxyRequests || isLoadingWithdrawalQueue;

  const boostableStethShares =
    includeBoost && positionData?.availableMintingCapacityStethShares
      ? positionData.availableMintingCapacityStethShares
      : undefined;

  const isEmpty =
    (positionData?.withdrawalRequests?.length ?? 0) === 0 &&
    (proxyRequests?.pending.length ?? 0) === 0 &&
    (proxyRequests?.finalized.length ?? 0) === 0 &&
    !canBoost(boostableStethShares) &&
    !canProcessRequest(positionData, minProcessableValueInEth) &&
    !canRecover(positionData);

  return {
    isEmpty,
    isLoading,
    proxyRequests,
    positionData,
    withdrawalRequests: positionData?.withdrawalRequests,
    boostableStethShares,
    minProcessableValueInEth,
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
    minProcessableValueInEth,
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
    //  we can divide total pending to unlock ETH proportionally between requests,
    //  this is purely visual so precision loss is acceptable
    const totalSharesPendingDenominator =
      withdrawalRequests?.reduce((acc, request) => acc + request.shares, 0n) ??
      1n;
    const totalValuePendingInEth =
      positionData?.totalValuePendingFromStrategyVaultInEth ?? 0n;

    const adjustedRequests = withdrawalRequests?.map((request) => {
      const unlockedETH =
        (request.shares * totalValuePendingInEth) /
        totalSharesPendingDenominator;
      return {
        ...request,
        unlockedETH,
      };
    });

    return {
      pendingEarnRequests: adjustedRequests?.filter(
        (request) => !request.isClaimable,
      ),
      claimableEarnRequests: adjustedRequests?.filter(
        (request) => request.isClaimable,
      ),
    };
  }, [withdrawalRequests, positionData]);

  const { processableRequest, processWithdrawalRequest } = useMemo(() => {
    const request =
      positionData &&
      typeof minProcessableValueInEth === 'bigint' &&
      canProcessRequest(positionData, minProcessableValueInEth)
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
                minProcessableValueInEth,
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
  }, [positionData, minProcessableValueInEth, processWithdrawal]);

  const { recoverable, recoverRewards } = useMemo(() => {
    const recoverablePosition =
      positionData && canRecover(positionData)
        ? {
            stethSharesToRecover: positionData.stethSharesToRecover,
            recoverTokenAddress: positionData.recoverTokenAddress,
          }
        : undefined;
    return {
      recoverable: recoverablePosition,

      recoverRewards: recoverablePosition
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
    const isBoostable = canBoost(boostableStethShares);
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
