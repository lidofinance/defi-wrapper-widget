import { useMemo } from 'react';
import { useVaultCapacity } from '@/modules/defi-wrapper';
import { useStethApr, useVaultApr } from '@/modules/vaults';
import { aprToApy } from '@/utils/apr-to-apy';

import { useGGVApr } from './use-ggv-apr';
import { useGGVStrategyPosition } from './use-ggv-strategy-position';

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

export const useGGVStrategyApy = () => {
  const { data: vaultApr, isPending: isLoadingVaultApr } = useVaultApr();
  const { data: stethApr, isPending: isLoadingStethApr } = useStethApr();
  const { data: ggvApr, isPending: isLoadingGgvApr } = useGGVApr();
  const { data: vaultCapacity, isPending: isLoadingVaultCapacity } =
    useVaultCapacity();
  const { data: ggvPosition } = useGGVStrategyPosition();

  const isLoadingApr =
    isLoadingVaultApr ||
    isLoadingStethApr ||
    isLoadingGgvApr ||
    isLoadingVaultCapacity;

  const data = useMemo(() => {
    if (!vaultApr || !stethApr || !ggvApr || !vaultCapacity) {
      return undefined;
    }

    const defaultUtilizationRate = 1 - vaultCapacity.reserveRationUnit;

    const currentUtilizationRate =
      ggvPosition?.currentUtilizationBP !== undefined
        ? Number(ggvPosition.currentUtilizationBP) / 10000
        : undefined;

    const {
      netApr: aprSma,
      netApy: apySma,
      strategyApr: strategyAprSma,
      strategyApy: strategyApySma,
    } = calculateStrategyApy(
      ggvApr.averageApr,
      stethApr.smaApr,
      vaultApr.aprSma,
      defaultUtilizationRate,
    );

    const {
      netApr: aprDaily,
      netApy: apyDaily,
      strategyApr: strategyAprDaily,
      strategyApy: strategyApyDaily,
    } = calculateStrategyApy(
      ggvApr.dailyApr,
      stethApr.latestApr,
      vaultApr.aprDaily,
      defaultUtilizationRate,
    );

    const {
      netApr: aprSmaCurrent,
      netApy: apySmaCurrent,
      strategyApr: strategyAprSmaCurrent,
      strategyApy: strategyApySmaCurrent,
    } = currentUtilizationRate !== undefined
      ? calculateStrategyApy(
          ggvApr.averageApr,
          stethApr.smaApr,
          vaultApr.aprSma,
          currentUtilizationRate,
        )
      : {
          netApr: undefined,
          netApy: undefined,
          strategyApr: undefined,
          strategyApy: undefined,
        };

    return {
      aprSma,
      apySma,
      aprDaily,
      apyDaily,
      strategyAprDaily,
      strategyApyDaily,
      strategyAprSma,
      strategyApySma,

      aprSmaCurrent,
      apySmaCurrent,
      strategyAprSmaCurrent,
      strategyApySmaCurrent,
    };
  }, [vaultApr, stethApr, ggvApr, vaultCapacity, ggvPosition]);

  return { ...data, updatedAt: vaultApr?.updatedAt, isLoadingApr };
};
