import { aprToApy } from '@/utils/apr-to-apy';

export const calculateStrategyApy = (
  ggvAprPercent: number, // percent
  stethAprPercent: number, // percent
  vaultNetAprPercent: number, // percent
  utilizationRate: number, // 0 - 1, POOL RR for new deposits,  utilizationRate for existing deposits
) => {
  const ggvPureAprPercent = ggvAprPercent - stethAprPercent;
  const strategyApr = utilizationRate * ggvPureAprPercent;
  const netApr = strategyApr + vaultNetAprPercent;

  return {
    netApr,
    netApy: aprToApy(netApr),
    strategyApr,
    strategyApy: aprToApy(strategyApr),
  };
};
