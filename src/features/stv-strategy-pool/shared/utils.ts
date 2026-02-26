import { aprToApy } from '@/utils/apr-to-apy';

export const calculateStrategyApy = (
  strategyVaultAprPercent: number, // percent
  stethAprPercent: number, // percent
  vaultNetAprPercent: number, // percent
  utilizationRate: number, // 0 - 1, POOL RR for new deposits,  utilizationRate for existing deposits
) => {
  const strategyPureAprPercent = strategyVaultAprPercent - stethAprPercent;
  const strategyApr = utilizationRate * strategyPureAprPercent;
  const netApr = strategyApr + vaultNetAprPercent;

  return {
    netApr,
    netApy: aprToApy(netApr),
    strategyApr,
    strategyApy: aprToApy(strategyApr),
    vaultApr: vaultNetAprPercent,
    vaultApy: aprToApy(vaultNetAprPercent),
  };
};
