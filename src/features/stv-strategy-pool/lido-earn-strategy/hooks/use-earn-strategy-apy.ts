import { useMemo } from 'react';
import { useVaultCapacity } from '@/modules/defi-wrapper';
import { useStethApr, useVaultApr } from '@/modules/vaults';

import { aprToApy } from '@/utils/apr-to-apy';
import { calculateStrategyApy } from '../../shared';

import { useEarnApy } from './use-earn-apy';
import { useEarnPosition } from './use-earn-position';

export const useEarnStrategyApy = () => {
  const { data: vaultApr, isPending: isLoadingVaultApr } = useVaultApr();
  const { data: stethApr, isPending: isLoadingStethApr } = useStethApr();
  const { data: mellowApy, isPending: isLoadingMellowApy } = useEarnApy();
  const { data: vaultCapacity, isPending: isLoadingVaultCapacity } =
    useVaultCapacity();
  const { currentUtilizationBP, isPositionLoading } = useEarnPosition();

  const isLoadingApr =
    isLoadingVaultApr ||
    isLoadingStethApr ||
    isLoadingMellowApy ||
    isPositionLoading ||
    isLoadingVaultCapacity;

  const data = useMemo(() => {
    if (!vaultApr || !stethApr || !mellowApy || !vaultCapacity) {
      return undefined;
    }

    const defaultUtilizationRate = 1 - vaultCapacity.reserveRationUnit;

    const currentUtilizationRate =
      currentUtilizationBP !== undefined
        ? Number(currentUtilizationBP) / 10000
        : undefined;

    const mellowApr = aprToApy(mellowApy.apy);

    const {
      netApr: aprSma,
      netApy: apySma,
      strategyApr: strategyAprSma,
      strategyApy: strategyApySma,
    } = calculateStrategyApy(
      mellowApr,
      stethApr.smaApr,
      vaultApr.aprSma,
      defaultUtilizationRate,
    );

    const {
      netApr: aprSmaCurrent,
      netApy: apySmaCurrent,
      strategyApr: strategyAprSmaCurrent,
      strategyApy: strategyApySmaCurrent,
    } = currentUtilizationRate !== undefined
      ? calculateStrategyApy(
          mellowApr,
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
      strategyAprSma,
      strategyApySma,

      aprSmaCurrent,
      apySmaCurrent,
      strategyAprSmaCurrent,
      strategyApySmaCurrent,
    };
  }, [vaultApr, stethApr, mellowApy, vaultCapacity, currentUtilizationBP]);

  return { ...data, updatedAt: vaultApr?.updatedAt, isLoadingApr };
};
