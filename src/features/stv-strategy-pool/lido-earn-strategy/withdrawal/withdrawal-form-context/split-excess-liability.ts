import { clampZeroBN } from '@/utils/bn';

export const splitExcessLiability = (
  amount: bigint,
  strategyVaultStethExcess: bigint,
) => {
  const ethToPayForLiability = clampZeroBN(amount - strategyVaultStethExcess);
  const stethToWithdrawForExcess = clampZeroBN(amount - ethToPayForLiability);
  return { ethToPayForLiability, stethToWithdrawForExcess };
};
