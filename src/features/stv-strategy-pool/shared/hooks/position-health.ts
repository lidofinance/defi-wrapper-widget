import { minBN } from '@/utils/bn';

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
    totalStethLiabilityInEth,
    proxyBalanceStvInEth - proxyUnlockedBalanceStvInEth,
  );
  const assetShortfallInEth = totalStethLiabilityInEth - totalLockedEth;
  const isUnhealthy = totalLockedEth < totalStethLiabilityInEth;
  const isBadDebt = proxyBalanceStvInEth < totalStethLiabilityInEth;
  const proxyBalanceInEth = isVaultConnected
    ? proxyBalanceStvInEth
    : proxyNominalBalanceStvInEth;
  const totalUserValueInEth = proxyBalanceInEth + totalStethDifference;

  return {
    totalLockedEth,
    assetShortfallInEth,
    isUnhealthy,
    isBadDebt,
    totalUserValueInEth,
  };
};
