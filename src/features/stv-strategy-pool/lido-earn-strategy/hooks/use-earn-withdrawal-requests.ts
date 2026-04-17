import { useMemo } from 'react';
import {
  useRequests,
  useClaim,
  useWithdrawalQueue,
  useRewards,
} from '@/modules/defi-wrapper';

import {
  useBoostApy,
  useClaimProxyDistribution,
  useProcessWithdrawal,
  useRecover,
} from '../../shared/hooks';
import { useFinalizeEarnWithdrawal } from './use-earn-finalize-request';
import { useEarnPosition } from './use-earn-position';
import { encodeEarnSupplyParams } from '../utils';
import { useEarnStrategy } from './use-earn-strategy';

// Suppress processable request display when ETH amount is rounding dust from
// the wstETH→stETH→shares double conversion in the Lido Earn withdrawal path.
// Does not apply to the healing path (stethSharesToRepay > 0n), which is a
// legitimate liability repay with no ETH withdrawal.
const PROCESSABLE_ETH_DISPLAY_THRESHOLD = 10n;

const hasProcessRequest = (
  positionData: ReturnType<typeof useEarnPosition>['positionData'],
  minProccessableValueInEth: bigint | undefined,
) => {
  if (!positionData) return false;

  if (typeof minProccessableValueInEth === 'undefined') return false;

  if (
    positionData.totalEthToWithdrawFromProxy > PROCESSABLE_ETH_DISPLAY_THRESHOLD
  ) {
    return true;
  }

  return positionData.stethSharesToRepay > 0n;
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
  const { data: earnStrategyData } = useEarnStrategy();
  // Data fetching
  // requests to withdraw from GGV - STEP 1
  // position data - used to calcualted processable request - STEP 2
  const earnPosition = useEarnPosition();
  const { isPositionLoading, positionData } = earnPosition;
  // vanilla stv pool withdrawal requests - STEP 3
  const { data: proxyRequests, isPending: isLoadingProxyRequests } =
    useRequests();

  const { data: proxyRewards, isPending: isLoadingProxyRewards } = useRewards(
    earnStrategyData?.strategyProxyAddress,
  );

  const {
    minWithdrawalAmountInEth: minProcessableValueInEth,
    isPending: isLoadingWithdrawalQueue,
  } = useWithdrawalQueue();

  const isLoading =
    isPositionLoading ||
    isLoadingProxyRequests ||
    isLoadingProxyRewards ||
    isLoadingWithdrawalQueue;

  const boostableStethShares =
    includeBoost && positionData?.availableMintingCapacityStethShares
      ? positionData.availableMintingCapacityStethShares
      : undefined;

  const isEmpty =
    (positionData?.withdrawalRequests?.length ?? 0) === 0 &&
    (proxyRequests?.pending.length ?? 0) === 0 &&
    (proxyRequests?.finalized.length ?? 0) === 0 &&
    (proxyRewards?.rewardsInfo.length ?? 0) == 0 &&
    !canBoost(boostableStethShares) &&
    !hasProcessRequest(positionData, minProcessableValueInEth) &&
    !canRecover(positionData);

  return {
    isEmpty,
    isLoading,
    proxyRewards,
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
    proxyRewards,
    boostableStethShares,
    minProcessableValueInEth,
  } = useStrategyWithdrawalRequestsRead(includeBoost);

  // Mutations

  const { claim, mutation: claimMutation } = useClaim();
  const { processWithdrawal, mutation: proccessWithdrawalMutation } =
    useProcessWithdrawal();
  const { recover, mutation: recoverMutation } = useRecover();
  const { claimProxyDistribution, mutation: claimProxyDistributionMutation } =
    useClaimProxyDistribution();
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
      hasProcessRequest(positionData, minProcessableValueInEth)
        ? {
            stvToWithdraw: positionData.totalStvToWithdrawFromProxy,
            ethToReceive: positionData.totalEthToWithdrawFromProxy,
            stethSharesToRebalance: positionData.stethSharesToRebalance,
            stethSharesToRepay: positionData.stethSharesToRepay,
            // we can't process withdrawals below the minimum threshold
            // but if value is zero and it's just repay it's healing
            isBelowMinimumThreshold:
              positionData.totalStvToWithdrawFromProxy > 0n &&
              positionData.totalEthToWithdrawFromProxy -
                positionData.stethToRebalance <=
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

  const proxyClaimableRewards = useMemo(() => {
    return proxyRewards?.rewardsInfo.map((claimableDistribution) => {
      return {
        ...claimableDistribution,
        claim: () => {
          return claimProxyDistribution({
            claimableDistribution,
          });
        },
      };
    });
  }, [proxyRewards, claimProxyDistribution]);

  const { boostable, boostAPY } = useMemo(() => {
    const isBoostable = canBoost(boostableStethShares);
    return {
      boostable: isBoostable,
      boostAPY:
        isBoostable && boostableStethShares
          ? () => {
              return boost({
                boostableStethShares,
                supplyParams: encodeEarnSupplyParams({
                  isSync: false,
                  merkleProof: [],
                }),
              });
            }
          : undefined,
    };
  }, [boost, boostableStethShares]);

  const isPendingAction =
    proccessWithdrawalMutation.isPending ||
    claimMutation.isPending ||
    recoverMutation.isPending ||
    boostMutation.isPending ||
    finalizeEarnWithdrawalMutation.isPending ||
    claimProxyDistributionMutation.isPending;

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
    // rewards claimable via distributor
    proxyClaimableRewards,

    // apy boost
    boostable,
    boostAPY,

    isLoading,
    isEmpty,
    isPendingAction,
  };
};
