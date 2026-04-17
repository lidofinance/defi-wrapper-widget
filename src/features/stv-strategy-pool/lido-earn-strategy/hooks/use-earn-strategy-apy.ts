import { useMemo } from 'react';
import { useVaultCapacity } from '@/modules/defi-wrapper';
import { useStethApr, useVaultApr } from '@/modules/vaults';

import { apyToApr } from '@/utils/apr-to-apy';
import { calculateStrategyApy } from '../../shared';

import { useEarnApy } from './use-earn-apy';
import { useEarnPosition } from './use-earn-position';

export const useEarnStrategyApy = () => {
  const { data: vaultApr, isPending: isLoadingVaultApr } = useVaultApr();
  const { data: stethApr, isPending: isLoadingStethApr } = useStethApr();
  const { data: mellowApy, isPending: isLoadingMellowApy } = useEarnApy();
  const { data: vaultCapacity, isPending: isLoadingVaultCapacity } =
    useVaultCapacity();
  const { positionData } = useEarnPosition();

  const isLoadingApr =
    isLoadingVaultApr ||
    isLoadingStethApr ||
    isLoadingMellowApy ||
    isLoadingVaultCapacity;

  const data = useMemo(() => {
    if (!vaultApr || !stethApr || !mellowApy || !vaultCapacity) {
      return undefined;
    }

    const defaultUtilizationRate = 1 - vaultCapacity.reserveRationUnit;

    const currentUtilizationRate =
      positionData?.currentUtilizationBP !== undefined
        ? Number(positionData.currentUtilizationBP) / 10000
        : undefined;

    // Mellow API returns APY; convert down to APR before passing to calculateStrategyApy
    const mellowApr = apyToApr(mellowApy.apy);

    const {
      netApr: aprSma,
      netApy: apySma,
      strategyApr: strategyAprSma,
      strategyApy: strategyApySma,
      vaultApy,
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
      vaultApr,
      vaultApy,
      aprSmaCurrent,
      apySmaCurrent,
      strategyAprSmaCurrent,
      strategyApySmaCurrent,
    };
  }, [
    vaultApr,
    stethApr,
    mellowApy,
    vaultCapacity,
    positionData?.currentUtilizationBP,
  ]);

  return { ...data, updatedAt: vaultApr?.updatedAt, isLoadingApr };
};
