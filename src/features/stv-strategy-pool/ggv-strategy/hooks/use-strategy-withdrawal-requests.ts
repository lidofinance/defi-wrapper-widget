import { useMemo } from 'react';
import {
  useRequests,
  useClaim,
  useWithdrawalQueue,
} from '@/modules/defi-wrapper';

import { useBoostApy, useProcessWithdrawal, useRecover } from '../../shared';
import { useGGVCancelRequest } from './use-ggv-cancel-request';

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
    useProcessWithdrawal();
  const { claim, mutation: claimMutation } = useClaim();
  const { recover, mutation: recoverMutation } = useRecover();
  const { boost, mutation: boostMutation } = useBoostApy();

  //
  const { processableRequest, processWithdrawalRequest } = useMemo(() => {
    const entry =
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

    const action = entry
      ? () => {
          return processWithdrawal({
            stvToWithdraw: entry.stvToWithdraw,
            sharesToRepay: entry.stethSharesToRepay,
            sharesToRebalance: entry.stethSharesToRebalance,
            ethToReceive: entry.ethToReceive,
          });
        }
      : undefined;

    return { processableRequest: entry, processWithdrawalRequest: action };
  }, [ggvPosition, minProccessableValueInEth, processWithdrawal]);

  const { recoverable, recoverRewards } = useMemo(() => {
    const entry =
      ggvPosition && ggvPosition.stethSharesToRecover > 0n
        ? {
            stethSharesToRecover: ggvPosition.stethSharesToRecover,
            recoverTokenAddress: ggvPosition.recoverTokenAddress,
          }
        : undefined;

    const action = entry
      ? () => {
          return recover({
            assetToRecover: entry.recoverTokenAddress,
            amountToRecover: entry.stethSharesToRecover,
          });
        }
      : undefined;

    return { recoverable: entry, recoverRewards: action };
  }, [ggvPosition, recover]);

  const { boostable, boostAPY } = useMemo(() => {
    const flag = !!boostableStethShares && boostableStethShares > 0n;
    const action =
      flag && boostableStethShares
        ? () => {
            return boost({ boostableStethShares });
          }
        : undefined;
    return { boostable: flag, boostAPY: action };
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
