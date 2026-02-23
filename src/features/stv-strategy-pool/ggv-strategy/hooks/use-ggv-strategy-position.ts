import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import invariant from 'tiny-invariant';
import { useStvStrategy } from '@/modules/defi-wrapper';
import { useDappStatus, useEthUsd } from '@/modules/web3';
import { Token } from '@/types/token';
import { useStrategyPosition } from '../../shared';
import { useGGVStrategy } from './use-ggv-strategy';
import { encodeGGVWithdrawalParams, MAX_REQUEST_DEADLINE } from '../utils';
import { useGGVWithdrawalRequests } from './use-ggv-withdrawal-requests';

const useGGVStrategyPositionData = () => {
  const { address } = useDappStatus();
  const { strategy } = useStvStrategy();
  const { data: ggvStrategyData } = useGGVStrategy();

  return useQuery({
    queryKey: [
      'wrapper',
      'ggv-strategy-balance',
      { strategyAddress: strategy?.address, address },
    ],
    enabled: !!address && !!ggvStrategyData,
    queryFn: async () => {
      invariant(address, 'address is required');
      invariant(
        ggvStrategyData?.strategyProxyAddress,
        'strategyProxyAddress is required',
      );

      const { ggvStrategyContract, withdrawParams, strategyProxyAddress } =
        ggvStrategyData;

      const GGV_PARAMS = encodeGGVWithdrawalParams({
        discount: withdrawParams.minDiscount,
        secondsToDeadline: MAX_REQUEST_DEADLINE,
      });

      const ggvSharesBalance = await ggvStrategyContract.read.ggvOf([address]);

      const ggvBalanceInStethSharesOnVault =
        await ggvStrategyContract.read.previewWstethByGGV([
          ggvSharesBalance,
          GGV_PARAMS,
        ]);

      return {
        ggvSharesBalance,
        ggvBalanceInStethSharesOnVault,
        strategyProxyAddress,
      };
    },
  });
};

export const useGGVStrategyPosition = () => {
  const { data: ggvStrategyData } = useGGVStrategy();
  const { data: ggvStrategyPositionData } = useGGVStrategyPositionData();

  const withdrawalRequestsQuery = useGGVWithdrawalRequests();

  const balanceQuery = useStrategyPosition({
    strategyProxyAddress: ggvStrategyData?.strategyProxyAddress,
    strategyDepositStethSharesOffset: 0n,
    strategyStethSharesBalance:
      ggvStrategyPositionData?.ggvBalanceInStethSharesOnVault,
    strategyWithdrawalStethSharesOffset:
      withdrawalRequestsQuery.data?.totalStethSharesInRequests,
  });

  // adjust total value by pending withdrawal requests from GGV
  // this accounts for lower value in totalStethSharesAvailable in overall calculation and sums up to correct value(to 1-2 wei error)
  const totalValueInEth = balanceQuery.data?.totalUserValueInEth;

  const { usdAmount, ...usdQuery } = useEthUsd(totalValueInEth);

  const { pendingGGVRequests, expiredGGVRequests } = useMemo(() => {
    if (withdrawalRequestsQuery.data && balanceQuery.data) {
      const { requests, totalStethSharesInRequests } =
        withdrawalRequestsQuery.data;
      const totalValuePendingFromGGVInEth =
        balanceQuery.data.totalValuePendingFromStrategyVaultInEth;

      // convert to WithdrawalRequest type anjd adjust wsteth amounts to corresponding eth value
      const toRequest = (
        request: (typeof requests)['openRequests'][number],
      ) => ({
        id: request.metadata.nonce,
        isFinalized: false,
        isClaimed: false,
        amountOfAssets:
          (request.metadata.amountOfAssets * totalValuePendingFromGGVInEth) /
          totalStethSharesInRequests,
        timestamp: BigInt(request.metadata.creationTime),
        token: 'ETH' as Token,
        metadata: request.metadata,
      });

      return {
        pendingGGVRequests: requests.openRequests.map(toRequest),
        expiredGGVRequests: requests.expiredRequests.map(toRequest),
      };
    }
    return {
      pendingGGVRequests: undefined,
      expiredGGVRequests: undefined,
    };
  }, [withdrawalRequestsQuery.data, balanceQuery.data]);

  return {
    ...balanceQuery,
    usdQuery,
    totalValueInEth,
    isUSDLoading: usdQuery.isLoading || usdQuery.isPending,
    pendingGGVRequests,
    expiredGGVRequests,
    isBalanceLoading:
      balanceQuery.isPending || withdrawalRequestsQuery.isPending,
    usdAmount,
  };
};
