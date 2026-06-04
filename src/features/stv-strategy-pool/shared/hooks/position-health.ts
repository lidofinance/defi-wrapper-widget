import { clampZeroBN, minBN } from '@/utils/bn';

type PositionHealthParams = {
  proxyBalanceStvInEth: bigint;
  proxyUnlockedBalanceStvInEth: bigint;
  proxyNominalBalanceStvInEth: bigint;
  totalStethLiabilityInEth: bigint;
  totalStethDifference: bigint;
  isVaultConnected: boolean;
};

export const computePositionHealth = ({
  proxyBalanceStvInEth,
  proxyUnlockedBalanceStvInEth,
  proxyNominalBalanceStvInEth,
  totalStethLiabilityInEth,
  totalStethDifference,
  isVaultConnected,
}: PositionHealthParams) => {
  const totalLockedEth = minBN(
    // this is actual total locked eth value (clamp is sanity check)
    clampZeroBN(proxyBalanceStvInEth - proxyUnlockedBalanceStvInEth),
    // this is just a sanity/rounding check because locked cannot be greater than liability
    totalStethLiabilityInEth,
  );

  const proxyBalanceInEth = isVaultConnected
    ? // for connected vault we take net balance (could be with exceeding liability)
      proxyBalanceStvInEth
    : // for disconnected vault nominal balance is correct because no liability can exist (but can still be in accounting)
      proxyNominalBalanceStvInEth;

  // this represents how much locked ETH value is missing for position to be healthy
  // e.g. if user minted 10 stETH but now his ETH collateral can only mint at max 9.5 stETH, then shortfall is etherToLockForSteth(0.5 stETH)
  // no user value is lost but position is unhealthy and some inputs can only be calculated in health position
  const assetShortfallInEth = clampZeroBN(
    totalStethLiabilityInEth - totalLockedEth,
  );
  // position is unhealthy if there is some shortfall, but not bad debt because user still has more collateral than liability
  const isUnhealthy = totalLockedEth < totalStethLiabilityInEth;
  // position is in bad debt if no user value can cover it's liability
  const isBadDebt = proxyBalanceInEth < totalStethLiabilityInEth;

  // total user value that user will receive if he withdraws everything fully at this instant:
  // proxyBalanceInEth - represents user available collateral(incl net fees/excess liability occurred)
  // totalStethDifference - represents positive/negative difference between liability and available steth to repay it
  // e.g. if user earned more than liability, they get the difference as rewards
  //      if user lost minted value in strategy, this amount will be deducted via rebalance and thus reduces total user value
  // NB! proxyBalanceInEth can also decrease/increase from deposited amount due to vault performance/fees/side liability
  const totalUserValueInEth = proxyBalanceInEth + totalStethDifference;

  return {
    totalLockedEth,
    assetShortfallInEth,
    isUnhealthy,
    isBadDebt,
    totalUserValueInEth,
  };
};
