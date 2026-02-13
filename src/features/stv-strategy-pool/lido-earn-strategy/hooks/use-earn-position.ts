import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { useEarnStrategy } from './use-earn-strategy';
import { maxUint128 } from 'viem';
import { useStrategyPosition } from '../../shared';

const useEarnPositionData = () => {
  const { isPending, data: earnStrategy } = useEarnStrategy();

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
        earnVault,
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

      const pendingWithdrawalsInWsteth = withdrawalRequests.reduce(
        (acc, request) => acc + request.assets,
        0n,
      );

      const [[_, balanceInWsteth], [__, claimableDepositInWsteth]] =
        await Promise.all([
          lidoEarnStrategy.read.previewRedeem([balanceInEarnShares]),
          lidoEarnStrategy.read.previewRedeem([claimableDepositInEarnShares]),
        ]);

      return {
        pendingDepositTimestamp,
        pendingDepositsInWsteth,
        claimableDepositInWsteth,
        pendingWithdrawalsInWsteth,
        balanceInWsteth,
        withdrawalRequests,
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

  return {
    positionQuery,
    ...(earnPositionData ?? {}),
    ...(positionQuery.data ?? {}),
  };
};
