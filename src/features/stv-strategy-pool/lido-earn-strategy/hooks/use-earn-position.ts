import { maxUint128 } from 'viem';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useEthUsd } from '@/modules/web3';
import { useStrategyPosition } from '../../shared';
import { useEarnStrategy } from './use-earn-strategy';

const useEarnPositionData = () => {
  const { data: earnStrategy } = useEarnStrategy();

  return useQuery({
    queryKey: [
      'wrapper',
      'earn-strategy-position-data',
      {
        lidoEarnStrategyAddress: earnStrategy?.lidoEarnStrategy.address,
        strategyProxyAddress: earnStrategy?.strategyProxyAddress,
      },
    ],
    enabled: !!earnStrategy && !!earnStrategy.strategyProxyAddress,
    queryFn: async () => {
      invariant(
        earnStrategy,
        'Earn strategy is required to fetch position data',
      );
      const {
        strategyProxyAddress,
        asyncDepositQueue,
        asyncRedeemQueue,
        lidoEarnStrategy,
        shareManager,
      } = earnStrategy;

      invariant(
        strategyProxyAddress,
        'Strategy proxy address is required to fetch position data',
      );

      const [
        [pendingDepositTimestamp, pendingDepositsInWsteth],
        claimableDepositInEarnShares,
        withdrawalRequests,
        balanceInEarnShares,
      ] = await Promise.all([
        asyncDepositQueue.read.requestOf([strategyProxyAddress]),
        asyncDepositQueue.read.claimableOf([strategyProxyAddress]),
        asyncRedeemQueue.read.requestsOf([
          strategyProxyAddress,
          0n,
          maxUint128,
        ]),
        shareManager.read.balanceOf([strategyProxyAddress]),
      ]);

      const [[_, balanceInWsteth], [__, claimableDepositInWsteth]] =
        await Promise.all([
          lidoEarnStrategy.read.previewRedeem([balanceInEarnShares]),
          lidoEarnStrategy.read.previewRedeem([claimableDepositInEarnShares]),
        ]);

      const previewedWithdrawalRequests = await Promise.all(
        withdrawalRequests.map(async (request) => {
          if (request.isClaimable) {
            return request;
          }

          const [___, previewBalanceInWsteth] =
            await lidoEarnStrategy.read.previewRedeem([request.shares]);

          return {
            ...request,
            assets: previewBalanceInWsteth,
          };
        }),
      );

      const pendingWithdrawalsInWsteth = previewedWithdrawalRequests.reduce(
        (acc, request) => acc + request.assets,
        0n,
      );

      return {
        pendingDepositTimestamp,
        pendingDepositsInWsteth,
        claimableDepositInWsteth,
        pendingWithdrawalsInWsteth,
        balanceInWsteth,
        withdrawalRequests: previewedWithdrawalRequests,
        balanceInEarnShares,
        claimableDepositInEarnShares,
      };
    },
  });
};

export const useEarnPosition = () => {
  const { data: earnStrategy } = useEarnStrategy();

  const { data: earnPositionData } = useEarnPositionData();

  const positionQuery = useStrategyPosition({
    strategyProxyAddress: earnStrategy?.strategyProxyAddress,
    strategyDepositStethSharesOffset: earnPositionData?.pendingDepositsInWsteth,
    strategyStethSharesBalance: earnPositionData
      ? earnPositionData?.balanceInWsteth +
        earnPositionData?.claimableDepositInWsteth
      : undefined,
    strategyWithdrawalStethSharesOffset:
      earnPositionData?.pendingWithdrawalsInWsteth,
  });

  const { usdAmount: totalUserValueInUsd, isPending: isUsdAmountLoading } =
    useEthUsd(positionQuery.data?.totalUserValueInEth);

  return {
    positionQuery,
    positionData:
      positionQuery.data && earnPositionData
        ? {
            ...positionQuery.data,
            ...earnPositionData,
          }
        : undefined,
    isPositionLoading: positionQuery.isPending,
    totalUserValueInUsd,
    isUsdAmountLoading,
  };
};
