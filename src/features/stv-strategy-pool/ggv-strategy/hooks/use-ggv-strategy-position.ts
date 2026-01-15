import { useMemo } from 'react';
import { Address } from 'viem';
import { useQuery } from '@tanstack/react-query';

import invariant from 'tiny-invariant';
import { useStvStrategy } from '@/modules/defi-wrapper';
import { readWithReport, useVault } from '@/modules/vaults';
import { useDappStatus, useEthUsd, useLidoSDK } from '@/modules/web3';
import { Token } from '@/types/token';
import { absBN, minBN, maxBN, signBN } from '@/utils/bn';
import { useGGVStrategy } from './use-ggv-strategy';
import { encodeGGVWithdrawalParams, MAX_REQUEST_DEADLINE } from '../utils';
import { useGGVWithdrawalRequests } from './use-ggv-withdrawal-requests';

type GetGGVStrategyPositionParams = {
  address: Address;
  activeVault: NonNullable<ReturnType<typeof useVault>['activeVault']>;
  publicClient: ReturnType<typeof useLidoSDK>['publicClient'];
  shares: ReturnType<typeof useLidoSDK>['shares'];
  wrapper: ReturnType<typeof useStvStrategy>['wrapper'];
  dashboard: NonNullable<ReturnType<typeof useStvStrategy>['dashboard']>;
  ggvStrategyData: NonNullable<ReturnType<typeof useGGVStrategy>['data']>;
  avaliableStethSharesOffset: bigint;
};

export const getGGVStrategyPosition = async ({
  publicClient,
  ggvStrategyData,
  address,
  activeVault,
  shares,
  wrapper,
  dashboard,
  avaliableStethSharesOffset,
}: GetGGVStrategyPositionParams) => {
  const { ggvStrategyContract, withdrawParams, strategyProxyAddress } =
    ggvStrategyData;
  invariant(strategyProxyAddress, 'strategyProxyAddress is required');

  const GGV_PARAMS = encodeGGVWithdrawalParams({
    discount: withdrawParams.minDiscount,
    secondsToDeadline: MAX_REQUEST_DEADLINE,
  });

  //
  // Base state
  //

  const ggvSharesBalance = await ggvStrategyContract.read.ggvOf([address]);

  const [
    ggvBalanceInStethSharesOnVault,
    stethSharesOnBalance,
    totalMintedStethShares,
    wstethAddress,
    proxyBalanceStv,
    reserveRatioBP,
  ] = await Promise.all([
    ggvStrategyContract.read.previewWstethByGGV([ggvSharesBalance, GGV_PARAMS]),
    ggvStrategyContract.read.wstethOf([address]),
    ggvStrategyContract.read.mintedStethSharesOf([address]),
    ggvStrategyContract.read.WSTETH(),
    wrapper.read.balanceOf([strategyProxyAddress]),
    wrapper.read.poolReserveRatioBP(),
  ]);

  // adjust ggv balance by pending withdrawal requests
  // this ensures we account correctly for delegated stETH and will not rebalance what is not lost yet
  const ggvBalanceInStethShares =
    ggvBalanceInStethSharesOnVault + avaliableStethSharesOffset;

  /// GLOSSARY:
  /// strategy proxy - contract that interacts with GGV on behalf of user and holds tokens
  /// liability -  stETH shares minted against user provided ETH
  /// delegated stETH - stETH shares that are on delegated to 3rd party (GGV) for rewards occural
  /// returned stETH - stETH shares that are on strategy proxy balance(returned from GGV or somehow else)
  /// available stETH - stETH shares that are available strategy proxy (returned + delegated)

  ///
  /// Calculation of total steth availability(returned balance + delegate to ggv)/liability and total user value
  ///
  /// This is used to display total user position in strategy accounting to occured profit/loss in delegated stETH
  ///

  // total stETH shares that strategy has to cover its liability 0 -> inf
  const totalStethSharesAvailable =
    ggvBalanceInStethShares + stethSharesOnBalance;

  // steth difference between avaliable and liability
  // <0 -> user exprerienced loss on strategy and loss will be rebalanced from his locked ETH
  // >=0 -> user exprerienced profit(or neutral) on strategy and excess will be added to his total value and can be withdrawn as (w)stETH
  const totalStethSharesDifference =
    totalStethSharesAvailable - totalMintedStethShares;

  // steth profit & loss
  const totalStethSharesExcess = maxBN(totalStethSharesDifference, 0n);
  const totalStethSharesShortfall = absBN(
    minBN(totalStethSharesDifference, 0n),
  );

  ///
  /// Strategy withdrawal
  ///

  // total stETH shares that are minted but not on balance (delegated)
  const totalStethSharesDelegated = maxBN(
    totalMintedStethShares - stethSharesOnBalance,
    0n,
  );

  // total stETH shares that can be withdrawn for repayment of delegated liability
  const totalStethSharesAvailableForReturn = minBN(
    ggvBalanceInStethShares,
    totalStethSharesDelegated,
  );

  // excess of ggv balance after repaying delegated liability (0 -> inf)
  // to be added to total user value
  const ggvStethSharesExcess =
    ggvBalanceInStethShares - totalStethSharesAvailableForReturn;

  //
  // Pending strategy withdrawa
  //

  const stethSharesToRepayPendingFromGGV = maxBN(
    avaliableStethSharesOffset - ggvStethSharesExcess,
    0n,
  );

  //
  // Proxy withdrawal
  //

  // stETH shares that must be burned without touching delegated stETH
  // it's important that this value is not just totalMintedStethShares thus
  // allowing user to withdraw partial position from strategy
  // and correctly repay only returned part without rebalancing the rest of STV
  //
  // can eq 0n - means only profit was skimmed from ggv
  // can eq totalMintedStethShares - means all ggv position is withdrawn
  const stethSharesLiabilityToCover = maxBN(
    totalMintedStethShares - ggvBalanceInStethShares,
    0n,
  );

  // out of totalStethSharesLiabilityToCover above:

  // stETH shares that can be repaid from returned balance and unlock user ETH
  // can eq 0n - no stETH is to be repaid(only rewards to skim) or all stETH is lost and must be rebalanced
  // can eq stethSharesLiabilityToCover - all repayment can be done from returned balance
  const stethSharesToRepay = minBN(
    stethSharesOnBalance,
    stethSharesLiabilityToCover,
  );

  // because ggv deposits/withdrawals are dealt in wstETH for most part we can assume stethShares === wsteth
  // but this simulates wsteth unwrapping with all it's dirty wei stealing
  // same as this trick which is stolen from contract source:
  // see StvStETHPool.sol:StvStETHPool.burnWsteth
  const stethSharesRepaidAfterWstethUnwrap = await shares.convertToShares(
    await shares.convertToSteth(stethSharesToRepay),
  );

  // stETH shares that user is missing, it will be rebalanced and
  // essentially reduced from locked ETH
  // can eq 0n - all repayment can be done from returned balance
  // can eq totalStethSharesToRepay - all stETH is lost and must be rebalanced
  // cannot be less then 0n because subtracted part is always <= stethSharesLiabilityToCover
  const stethSharesToRebalance =
    stethSharesLiabilityToCover - stethSharesRepaidAfterWstethUnwrap;

  // stETH shares that can be recovered as profit above returned liability repayment
  // this can be withdrawn as (w)stETH
  const stethSharesToRecover = maxBN(
    stethSharesOnBalance - stethSharesToRepay,
    0n,
  );

  const [
    proxyBalanceStvInEth,
    proxyUnlockedBalanceStvInEth,
    unlockedStv,
    //
    totalStethLiabilityInEth,
    totalStethSharesAvailableForReturnInEth,
    withdrawableStvAfterRepay,
    withdrawableEthAfterRepay,
    pendingUnlockFromGGVInEth,
    //
    currentProxyMintingCapacityShares,
    currentVaultMintingCapacityShares,
  ] = await readWithReport({
    publicClient,
    report: activeVault.report,
    contracts: [
      wrapper.prepare.assetsOf([strategyProxyAddress]),
      wrapper.prepare.unlockedAssetsOf([strategyProxyAddress, 0n]),
      wrapper.prepare.unlockedStvOf([strategyProxyAddress, 0n]),
      //
      wrapper.prepare.calcAssetsToLockForStethShares([totalMintedStethShares]),
      wrapper.prepare.calcAssetsToLockForStethShares([
        totalStethSharesAvailableForReturn,
      ]),
      wrapper.prepare.unlockedStvOf([
        strategyProxyAddress,
        // this includes unlocked by repayment + rebalanced beacause it's the value passed to withdrawal queue
        stethSharesLiabilityToCover,
      ]),
      wrapper.prepare.unlockedAssetsOf([
        strategyProxyAddress,
        // this includes unlocked ONLY by repayment(wsteth unwrap adjusted) because that's what user will actually receive
        stethSharesRepaidAfterWstethUnwrap,
      ]),
      wrapper.prepare.calcAssetsToLockForStethShares([
        stethSharesToRepayPendingFromGGV,
      ]),
      //
      wrapper.prepare.remainingMintingCapacitySharesOf([
        strategyProxyAddress,
        0n,
      ]),
      dashboard.prepare.remainingMintingCapacityShares([0n]),
    ] as const,
  });

  const [
    ggvBalanceInSteth,
    stethOnBalance,
    totalMintedSteth,
    ggvStethExcess,
    totalStethDifferenceABS,
    //
    totalStethToRepay,
    stethToRepay,
    stethToRebalance,
    stethToRecover,
  ] = await Promise.all([
    shares.convertToSteth(ggvBalanceInStethShares),
    shares.convertToSteth(stethSharesOnBalance),
    shares.convertToSteth(totalMintedStethShares),
    shares.convertToSteth(ggvStethSharesExcess),
    shares.convertToSteth(absBN(totalStethSharesDifference)),
    //
    shares.convertToSteth(stethSharesLiabilityToCover),
    shares.convertToSteth(stethSharesToRepay),
    shares.convertToSteth(stethSharesToRebalance),
    shares.convertToSteth(stethSharesToRecover),
  ]);

  // represents how much eth is actually locked to cover total liability
  // can be less than totalMintedStethInEth if position is unhealthy
  const totalLockedEth = minBN(
    totalStethLiabilityInEth,
    proxyBalanceStvInEth - proxyUnlockedBalanceStvInEth,
  );

  // represents how much eth is missing from locked to cover total liability
  // can be 0n if position is healthy
  const assetShortfallInEth = totalStethLiabilityInEth - totalLockedEth;

  const isUnhealthy = totalLockedEth < totalStethLiabilityInEth;

  const isBadDebt = proxyBalanceStvInEth < totalStethLiabilityInEth;

  const totalStethDifference =
    signBN(totalStethSharesDifference) * totalStethDifferenceABS;

  const totalUserValueInEth = proxyBalanceStvInEth + totalStethDifference;

  // maximum ETH that can be withdrawn from GGV (for delegated stETH repayment + excess) assuming healthy position
  // if stv position is unhealthy this number can be higher than user balance in eth
  const totalEthToWithdrawFromGGV =
    totalStethSharesAvailableForReturnInEth + ggvStethExcess;

  // stv that will be requested withdrawn from strategy proxy
  // range: 0 -> proxy stv balance
  // 0 - no withdrawal needed, only rewards to skim
  // n < proxy stv balance -> partial withdraw of position
  // n = proxy stv balance -> full withdraw of position
  const totalStvToWithdrawFromProxy = withdrawableStvAfterRepay;

  // eth that will be withdrawn from strategy proxy
  // ONLY FOR DISPLAY: can contain calculation erros due to conversions
  const totalEthToWithdrawFromProxy = maxBN(
    withdrawableEthAfterRepay - stethToRebalance,
    0n,
  );

  // this represents value of ether that is pending withdrawal from GGV to strategy proxy
  // it's constructed from:
  // - unlocked ETH by steth shares that will be repaid from GGV pending withdrawal requests (calculated by RR)
  //    this value is capped by total user locked ETH to prevent overestimation in unhealthy positions
  // - excess wsteth(in eth) that can be recovered calculated 1:1
  const totalValuePendingFromGGVInEth =
    minBN(pendingUnlockFromGGVInEth, totalLockedEth) + ggvStethExcess;

  //
  // Boosting APY via supply(0)
  //

  const availableMintingCapacityStethShares = minBN(
    currentProxyMintingCapacityShares,
    currentVaultMintingCapacityShares,
  );

  const targetUtilizationBP = 10_000n - reserveRatioBP;
  const currentUtilizationBP =
    proxyBalanceStvInEth > 0n
      ? (totalMintedSteth * 10_000n) / proxyBalanceStvInEth
      : 0n;

  return {
    //
    // Raw State
    //

    // balance im STV
    proxyBalanceStv,
    proxyBalanceStvInEth,
    unlockedStv,
    // available in GGV
    ggvSharesBalance,
    ggvBalanceInStethShares,
    ggvBalanceInSteth,
    // returned to proxy
    stethOnBalance,
    stethSharesOnBalance,
    // Liability
    totalMintedSteth,
    totalMintedStethShares,

    //
    // Computed state
    //
    // total user ETH value in strategy (proxyBalanceStvInEth + profit/loss from stETH delegation)
    totalUserValueInEth,
    //profit/loss from stETH delegation
    totalStethDifference,
    // normilized profit/loss values
    totalStethSharesExcess,
    totalStethSharesShortfall,
    lockedEthForTotalMintedSteth: totalStethLiabilityInEth,

    isUnhealthy,
    isBadDebt,
    totalLockedEth,
    assetShortfallInEth,

    //
    // Withdrawing delegated stETH from GGV
    //
    // total ETH that can be withdrawn from GGV (for delegated stETH repayment + excess)
    totalEthToWithdrawFromGGV,
    // stETH shares that can be withdrawn from GGV above delegated liability
    ggvStethExcess,
    ggvStethSharesExcess,

    //
    // Withdrawing ETH from strategy proxy
    //
    totalStethToRepay,
    totalStethSharesToRepay: stethSharesLiabilityToCover,

    stethToRepay,
    stethSharesToRepay,

    stethToRebalance,
    stethSharesToRebalance,

    stethToRecover,
    stethSharesToRecover,
    recoverTokenAddress: wstethAddress,
    // unlocked stv in eth that is already been repaid due to partial tx
    // or due to vault rewards now available for mint&deposit to strategy
    proxyUnlockedBalanceStvInEth,
    //
    totalStvToWithdrawFromProxy,
    totalEthToWithdrawFromProxy,
    totalValuePendingFromGGVInEth,

    // Minting capacity
    availableMintingCapacityStethShares,
    currentUtilizationBP,
    targetUtilizationBP,
  };
};

export const useGGVStrategyPosition = () => {
  const { publicClient } = useLidoSDK();
  const { activeVault, queryKeys } = useVault();
  const { address } = useDappStatus();
  const { shares } = useLidoSDK();
  const { wrapper, strategy, dashboard } = useStvStrategy();
  const { data: ggvStrategyData } = useGGVStrategy();

  const withdrawalRequestsQuery = useGGVWithdrawalRequests();

  const balanceQuery = useQuery({
    queryKey: [
      ...queryKeys.state,
      'ggv-strategy-balance',
      {
        strategyAddress: strategy?.address,
        address,
        ggvStethSharesOffset: (
          withdrawalRequestsQuery.data?.totalStethSharesInRequests ?? 0n
        ).toString(),
      },
    ],
    // this is large query so we must be conservative with refetches
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled:
      !!address &&
      !!wrapper &&
      !!activeVault &&
      !!ggvStrategyData &&
      // we wait for ggv withdrwal request to load up but if it fails we still procced with zero offset
      !withdrawalRequestsQuery.isPending,
    queryFn: async () => {
      invariant(activeVault, 'activeVault is required');
      invariant(wrapper, 'wrapper is required');
      invariant(address, 'address is required');
      invariant(ggvStrategyData, 'strategy is required');
      invariant(dashboard, 'dashboard is required');

      return getGGVStrategyPosition({
        publicClient,
        ggvStrategyData,
        address,
        activeVault,
        shares,
        wrapper,
        dashboard,
        avaliableStethSharesOffset:
          withdrawalRequestsQuery.data?.totalStethSharesInRequests ?? 0n,
      });
    },
  });

  // adjust total value by pending withdrawal requests from GGV
  // this accounts for lower value in totalStethSharesAvailable in overall calculation and sums up to correct value(to 1-2 wei error)
  const totalValueInEth = balanceQuery.data?.totalUserValueInEth;

  const { usdAmount, ...usdQuery } = useEthUsd(totalValueInEth);

  const { pendingGGVRequests, expiredGGVRequests } = useMemo(() => {
    if (withdrawalRequestsQuery.data && balanceQuery.data) {
      const { requests, totalStethSharesInRequests } =
        withdrawalRequestsQuery.data;
      const { totalValuePendingFromGGVInEth } = balanceQuery.data;

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

      const pendingGGVRequests =
        withdrawalRequestsQuery.data.requests.openRequests.map(toRequest);

      const expiredGGVRequests =
        withdrawalRequestsQuery.data.requests.expiredRequests.map(toRequest);

      return {
        pendingGGVRequests,
        expiredGGVRequests,
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
