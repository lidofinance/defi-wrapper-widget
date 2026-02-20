import { Address } from 'viem';
import { useQuery } from '@tanstack/react-query';

import invariant from 'tiny-invariant';
import { useStvStrategy } from '@/modules/defi-wrapper';
import { readWithReport, useVault } from '@/modules/vaults';
import { useDappStatus, useLidoSDK } from '@/modules/web3';
import { absBN, minBN, maxBN } from '@/utils/bn';

type GetStrategyPositionDynamicParams = {
  strategyProxyAddress: Address;

  // balance in steth shares that are generating yield in strategy vault
  strategyStethSharesBalance: bigint;
  // stethShares that are pending deposit to strategy
  strategyDepositStethSharesOffset: bigint;
  // stethShares that are pending withdrawal from strategy
  strategyWithdrawalStethSharesOffset: bigint;
};

type GetStrategyPositionParams = {
  // contracts&globals
  activeVault: NonNullable<ReturnType<typeof useVault>['activeVault']>;
  publicClient: ReturnType<typeof useLidoSDK>['publicClient'];
  shares: ReturnType<typeof useLidoSDK>['shares'];
  wrapper: ReturnType<typeof useStvStrategy>['wrapper'];
  dashboard: NonNullable<ReturnType<typeof useStvStrategy>['dashboard']>;
  strategy: NonNullable<ReturnType<typeof useStvStrategy>['strategy']>;
  // user state
  address: Address;
} & GetStrategyPositionDynamicParams;

export const getStrategyPosition = async ({
  publicClient,
  strategy,
  activeVault,
  shares,
  wrapper,
  dashboard,
  strategyProxyAddress,
  strategyWithdrawalStethSharesOffset,
  strategyDepositStethSharesOffset,
  strategyStethSharesBalance,
  address,
}: GetStrategyPositionParams) => {
  /// GLOSSARY:
  /// strategy - contracts that user interacts with
  /// strategy vault - 3rd party protocol where wstETH is deposited to generate yield
  /// strategy proxy - underlying contract that interacts with Strategy Vault on behalf of user and holds tokens
  /// liability -  stETH shares minted against user provided ETH
  /// delegated stETH - stETH shares that are on delegated to 3rd party (strategy vault) for rewards accrual
  /// returned stETH - stETH shares that are on strategy proxy balance(returned from strategy vault or somehow else)
  /// available stETH - stETH shares that are available strategy proxy (returned + delegated)

  //
  // Base state
  //

  const [
    stethSharesOnBalance,
    totalMintedStethShares,
    wstethAddress,
    proxyBalanceStv,
    reserveRatioBP,
  ] = await Promise.all([
    strategy.read.wstethOf([address]),
    strategy.read.mintedStethSharesOf([address]),
    strategy.read.WSTETH(),
    wrapper.read.balanceOf([strategyProxyAddress]),
    wrapper.read.poolReserveRatioBP(),
  ]);

  // adjust strategy balance by actual + pending deposits/withdrawals in stETH shares
  // this ensures we account correctly for delegated stETH and will not rebalance what is not lost yet
  // total sum accounts for total user balance
  // while strategyStethSharesBalance only accounts for what currently can be requested for withdrawal
  const totalStrategyBalanceInStethShares =
    strategyDepositStethSharesOffset +
    strategyStethSharesBalance +
    strategyWithdrawalStethSharesOffset;

  ///
  /// Calculation of total steth availability(returned balance + delegate to strategy vault)/liability and total user value
  ///
  /// This is used to display total user position in strategy accounting to occurred profit/loss in delegated stETH
  ///

  // total stETH shares that strategy has to cover its liability 0 -> inf
  const totalStethSharesAvailable =
    totalStrategyBalanceInStethShares + stethSharesOnBalance;

  // steth difference between available and liability
  // <0 -> user experienced loss on strategy and loss will be rebalanced from his locked ETH
  // >=0 -> user experienced profit(or neutral) on strategy and excess will be added to his total value and can be withdrawn as (w)stETH
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
  // we only include actual strategy vault balance because pending deposits/withdrawals cannot be withdrawn(but they count towards user total value)
  const totalStethSharesAvailableForReturn = minBN(
    strategyStethSharesBalance,
    totalStethSharesDelegated,
  );

  // excess of strategy vault balance after repaying delegated liability (0 -> inf)
  // to be added to total user value
  const strategyStethSharesExcess =
    strategyStethSharesBalance - totalStethSharesAvailableForReturn;

  //
  // Pending strategy withdraw
  //

  const stethSharesToRepayPendingFromStrategyVault = maxBN(
    strategyWithdrawalStethSharesOffset + strategyStethSharesExcess,
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
  // can eq 0n - means only profit was skimmed from strategy vault
  // can eq totalMintedStethShares - means all strategy vault position is withdrawn
  const stethSharesLiabilityToCover = maxBN(
    totalMintedStethShares - totalStrategyBalanceInStethShares,
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

  // because strategy vault deposits/withdrawals are dealt in wstETH for most part we can assume stethShares === wsteth
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
    pendingUnlockFromStrategyVaultInEth,
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
        // this includes unlocked by repayment + rebalanced because it's the value passed to withdrawal queue
        stethSharesLiabilityToCover,
      ]),
      wrapper.prepare.unlockedAssetsOf([
        strategyProxyAddress,
        // this includes unlocked ONLY by repayment(wsteth unwrap adjusted) because that's what user will actually receive
        stethSharesRepaidAfterWstethUnwrap,
      ]),
      wrapper.prepare.calcAssetsToLockForStethShares([
        stethSharesToRepayPendingFromStrategyVault,
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
    totalStrategyBalanceInSteth,
    stethOnBalance,
    //
    totalMintedSteth,
    strategyVaultStethExcess,
    totalStethDifference,
    //
    totalStethToRepay,
    stethToRepay,
    stethToRebalance,
    stethToRecover,
  ] = await shares.convertBatchSharesToSteth([
    totalStrategyBalanceInStethShares,
    stethSharesOnBalance,
    //
    totalMintedStethShares,
    strategyStethSharesExcess,
    totalStethSharesDifference,
    //
    stethSharesLiabilityToCover,
    stethSharesToRepay,
    stethSharesToRebalance,
    stethSharesToRecover,
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

  const totalUserValueInEth = proxyBalanceStvInEth + totalStethDifference;

  // maximum ETH that can be withdrawn from strategy vault (for delegated stETH repayment + excess) assuming healthy position
  // if stv position is unhealthy this number can be higher than user balance in eth
  const totalEthToWithdrawFromStrategyVault =
    totalStethSharesAvailableForReturnInEth + strategyVaultStethExcess;

  // stv that will be requested withdrawn from strategy proxy
  // range: 0 -> proxy stv balance
  // 0 - no withdrawal needed, only rewards skim
  // n < proxy stv balance -> partial withdraw of position
  // n = proxy stv balance -> full withdraw of position
  const totalStvToWithdrawFromProxy = withdrawableStvAfterRepay;

  // eth that will be withdrawn from strategy proxy
  // ONLY FOR DISPLAY: can contain calculation errors due to conversions
  const totalEthToWithdrawFromProxy = maxBN(
    withdrawableEthAfterRepay - stethToRebalance,
    0n,
  );

  // this represents value of ether that is pending withdrawal from strategy vault to strategy proxy
  // it's constructed from:
  // - unlocked ETH by steth shares that will be repaid from strategy vault pending withdrawal requests (calculated by RR)
  //    this value is capped by total user locked ETH to prevent overestimation in unhealthy positions
  // - excess wsteth(in eth) that can be recovered calculated 1:1
  const totalValuePendingFromStrategyVaultInEth =
    minBN(pendingUnlockFromStrategyVaultInEth, totalLockedEth) +
    strategyVaultStethExcess;

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
    // available in strategy vault
    totalStrategyBalanceInStethShares,
    totalStrategyBalanceInSteth,
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
    // normalized profit/loss values
    totalStethSharesExcess,
    totalStethSharesShortfall,
    lockedEthForTotalMintedSteth: totalStethLiabilityInEth,

    isUnhealthy,
    isBadDebt,
    totalLockedEth,
    assetShortfallInEth,

    //
    // Withdrawing delegated stETH from Strategy Vault
    //
    // total ETH that can be withdrawn from Strategy Vault (for delegated stETH repayment + excess)
    totalEthToWithdrawFromStrategyVault,
    // stETH shares that can be withdrawn from Strategy Vault above delegated liability
    strategyVaultStethExcess,
    strategyStethSharesExcess,

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
    totalValuePendingFromStrategyVaultInEth,
    // Minting capacity
    availableMintingCapacityStethShares,
    currentUtilizationBP,
    targetUtilizationBP,
  };
};

export const useStrategyPosition = (
  params: Partial<GetStrategyPositionDynamicParams>,
) => {
  const { publicClient } = useLidoSDK();
  const { activeVault, queryKeys } = useVault();
  const { address } = useDappStatus();
  const { shares } = useLidoSDK();
  const { wrapper, strategy, dashboard } = useStvStrategy();

  return useQuery({
    queryKey: [
      ...queryKeys.state,
      'strategy-balance-position',
      {
        strategyAddress: strategy?.address,
        address,
        ...params,
      },
    ],
    // this is large query so we must be conservative with refetches
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled:
      !!address &&
      !!wrapper &&
      !!activeVault &&
      !!strategy &&
      params.strategyProxyAddress !== undefined &&
      params.strategyStethSharesBalance !== undefined &&
      params.strategyDepositStethSharesOffset !== undefined &&
      params.strategyWithdrawalStethSharesOffset !== undefined,
    queryFn: async () => {
      invariant(activeVault, 'activeVault is required');
      invariant(wrapper, 'wrapper is required');
      invariant(address, 'address is required');
      invariant(dashboard, 'dashboard is required');
      invariant(strategy, 'strategy is required');

      invariant(
        params.strategyProxyAddress,
        'strategyProxyAddress is required to fetch strategy position',
      );

      return getStrategyPosition({
        publicClient,
        strategy,
        address,
        activeVault,
        shares,
        wrapper,
        dashboard,
        ...(params as GetStrategyPositionDynamicParams),
      });
    },
  });
};
