import { describe, it, expect } from 'vitest';
import { calculateStrategyApy } from './utils';

describe('calculateStrategyApy', () => {
  describe('netApr calculation', () => {
    it('netApr = strategyApr + vaultNetApr', () => {
      // strategyPure = 10-4 = 6, strategyApr = 0.5*6 = 3, netApr = 3+4 = 7
      const { netApr } = calculateStrategyApy(10, 4, 4, 0.5);
      expect(netApr).toBe(7);
    });

    it('zero utilization: netApr equals vaultNetAprPercent only', () => {
      const { netApr, strategyApr } = calculateStrategyApy(10, 4, 4, 0);
      expect(strategyApr).toBe(0);
      expect(netApr).toBe(4);
    });

    it('full utilization (1.0): strategyApr equals full strategyPureApr', () => {
      const { strategyApr } = calculateStrategyApy(10, 4, 0, 1);
      expect(strategyApr).toBe(6); // (10-4) * 1
    });
  });

  describe('APY > APR (compounding)', () => {
    it('netApy is greater than netApr for positive netApr', () => {
      const { netApr, netApy } = calculateStrategyApy(10, 4, 4, 0.5);
      expect(netApy).toBeGreaterThan(netApr);
    });

    it('strategyApy is greater than strategyApr for positive strategyApr', () => {
      const { strategyApr, strategyApy } = calculateStrategyApy(10, 4, 0, 0.5);
      expect(strategyApy).toBeGreaterThan(strategyApr);
    });

    it('vaultApy is greater than vaultApr for positive vaultApr', () => {
      const { vaultApr, vaultApy } = calculateStrategyApy(10, 4, 4, 0);
      expect(vaultApy).toBeGreaterThan(vaultApr);
    });
  });

  describe('return shape', () => {
    it('returns all expected fields', () => {
      const result = calculateStrategyApy(10, 4, 4, 0.5);
      expect(result).toHaveProperty('netApr');
      expect(result).toHaveProperty('netApy');
      expect(result).toHaveProperty('strategyApr');
      expect(result).toHaveProperty('strategyApy');
      expect(result).toHaveProperty('vaultApr');
      expect(result).toHaveProperty('vaultApy');
    });

    it('vaultApr is vaultNetAprPercent (passed through)', () => {
      const { vaultApr } = calculateStrategyApy(10, 4, 5.5, 0.5);
      expect(vaultApr).toBe(5.5);
    });
  });

  describe('strategy vault APR below stETH APR (negative pure APR)', () => {
    it('strategyApr is negative when vault underperforms stETH', () => {
      // strategyPure = 3-4 = -1, strategyApr = 0.5 * -1 = -0.5
      const { strategyApr } = calculateStrategyApy(3, 4, 0, 0.5);
      expect(strategyApr).toBe(-0.5);
    });

    it('netApr can be below vaultNetApr when strategy underperforms', () => {
      const { netApr } = calculateStrategyApy(3, 4, 4, 0.5);
      expect(netApr).toBe(3.5); // -0.5 + 4
    });
  });
});
