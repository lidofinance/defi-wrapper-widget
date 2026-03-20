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
        [depositTimestamp, depositsInWsteth],
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

      // if claimable > 0, deposit is no longer pending
      const pendingDepositsInWsteth =
        claimableDepositInEarnShares > 0n ? 0n : depositsInWsteth;

      const [[_, balanceInWsteth], [__, claimableDepositInWsteth]] =
        await Promise.all([
          balanceInEarnShares > 0n
            ? lidoEarnStrategy.read.previewRedeem([balanceInEarnShares])
            : [0n, 0n],
          claimableDepositInEarnShares > 0n
            ? lidoEarnStrategy.read.previewRedeem([
                claimableDepositInEarnShares,
              ])
            : [0n, 0n],
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
        depositTimestamp,
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

  const positionQuery = useStrategyPosition(
    earnPositionData && earnStrategy
      ? {
          strategyProxyAddress: earnStrategy.strategyProxyAddress,
          // pending deposits, they are not yet claimable(and not withdrawable) but count towards total values
          strategyDepositStethSharesOffset:
            earnPositionData.pendingDepositsInWsteth,
          // actual balance, includes claimable deposits and existing balance, counts towards total values and is fully withdrawable
          strategyStethSharesBalance:
            earnPositionData.balanceInWsteth +
            earnPositionData.claimableDepositInWsteth,
          // pending&claimable withdrawals, they count towards total value but are already withdrawn from strategy
          strategyWithdrawalStethSharesOffset:
            earnPositionData.pendingWithdrawalsInWsteth,
        }
      : {},
  );

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
