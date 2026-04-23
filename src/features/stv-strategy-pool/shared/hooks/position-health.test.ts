import { describe, it, expect } from 'vitest';
import { computePositionHealth } from './position-health';

const ETH = 10n ** 18n;

const base = {
  proxyBalanceStvInEth: 10n * ETH,
  proxyUnlockedBalanceStvInEth: 0n,
  proxyNominalBalanceStvInEth: 10n * ETH,
  totalStethLiabilityInEth: 8n * ETH,
  totalStethDifference: 0n,
  isVaultConnected: true,
};

describe('computePositionHealth — healthy position', () => {
  it('totalLockedEth equals liability when balance fully covers it', () => {
    const { totalLockedEth } = computePositionHealth(base);
    expect(totalLockedEth).toBe(8n * ETH);
  });

  it('assetShortfallInEth is 0 when healthy', () => {
    const { assetShortfallInEth } = computePositionHealth(base);
    expect(assetShortfallInEth).toBe(0n);
  });

  it('isUnhealthy is false', () => {
    expect(computePositionHealth(base).isUnhealthy).toBe(false);
  });

  it('isBadDebt is false', () => {
    expect(computePositionHealth(base).isBadDebt).toBe(false);
  });

  it('totalUserValueInEth = proxyBalance + stethDifference when connected', () => {
    const { totalUserValueInEth } = computePositionHealth({
      ...base,
      totalStethDifference: 2n * ETH,
    });
    expect(totalUserValueInEth).toBe(12n * ETH);
  });
});

describe('computePositionHealth — unhealthy but not bad debt', () => {
  // proxyBalance=10, unlocked=3, liability=8 → locked=min(8,7)=7 → unhealthy
  const unhealthy = {
    ...base,
    proxyBalanceStvInEth: 10n * ETH,
    proxyUnlockedBalanceStvInEth: 3n * ETH,
    totalStethLiabilityInEth: 8n * ETH,
  };

  it('totalLockedEth is balance minus unlocked (capped at liability)', () => {
    expect(computePositionHealth(unhealthy).totalLockedEth).toBe(7n * ETH);
  });

  it('assetShortfallInEth is the gap', () => {
    expect(computePositionHealth(unhealthy).assetShortfallInEth).toBe(1n * ETH);
  });

  it('isUnhealthy is true', () => {
    expect(computePositionHealth(unhealthy).isUnhealthy).toBe(true);
  });

  it('isBadDebt is false (proxyBalance >= liability)', () => {
    expect(computePositionHealth(unhealthy).isBadDebt).toBe(false);
  });
});

describe('computePositionHealth — bad debt', () => {
  // proxyBalance=5 < liability=8 → bad debt
  const badDebt = {
    ...base,
    proxyBalanceStvInEth: 5n * ETH,
    proxyUnlockedBalanceStvInEth: 0n,
    totalStethLiabilityInEth: 8n * ETH,
  };

  it('totalLockedEth is capped at proxyBalance', () => {
    expect(computePositionHealth(badDebt).totalLockedEth).toBe(5n * ETH);
  });

  it('assetShortfallInEth equals the bad debt gap', () => {
    expect(computePositionHealth(badDebt).assetShortfallInEth).toBe(3n * ETH);
  });

  it('isUnhealthy is true', () => {
    expect(computePositionHealth(badDebt).isUnhealthy).toBe(true);
  });

  it('isBadDebt is true', () => {
    expect(computePositionHealth(badDebt).isBadDebt).toBe(true);
  });

  // OBS-16: Mellow loss makes totalUserValueInEth negative
  it('totalUserValueInEth can be negative under severe loss (OBS-16)', () => {
    const { totalUserValueInEth } = computePositionHealth({
      ...badDebt,
      totalStethDifference: -7n * ETH,
    });
    expect(totalUserValueInEth).toBe(-2n * ETH);
    expect(totalUserValueInEth < 0n).toBe(true);
  });
});

describe('computePositionHealth — vault connected vs disconnected', () => {
  it('connected: uses proxyBalanceStvInEth for totalUserValueInEth', () => {
    const { totalUserValueInEth } = computePositionHealth({
      ...base,
      proxyBalanceStvInEth: 10n * ETH,
      proxyNominalBalanceStvInEth: 12n * ETH,
      isVaultConnected: true,
    });
    expect(totalUserValueInEth).toBe(10n * ETH);
  });

  it('disconnected: uses proxyNominalBalanceStvInEth for totalUserValueInEth', () => {
    const { totalUserValueInEth } = computePositionHealth({
      ...base,
      proxyBalanceStvInEth: 10n * ETH,
      proxyNominalBalanceStvInEth: 12n * ETH,
      isVaultConnected: false,
    });
    expect(totalUserValueInEth).toBe(12n * ETH);
  });
});

describe('computePositionHealth — zero position', () => {
  it('all zeros → all outputs are 0 and healthy', () => {
    const result = computePositionHealth({
      proxyBalanceStvInEth: 0n,
      proxyUnlockedBalanceStvInEth: 0n,
      proxyNominalBalanceStvInEth: 0n,
      totalStethLiabilityInEth: 0n,
      totalStethDifference: 0n,
      isVaultConnected: true,
    });
    expect(result.totalLockedEth).toBe(0n);
    expect(result.assetShortfallInEth).toBe(0n);
    expect(result.isUnhealthy).toBe(false);
    expect(result.isBadDebt).toBe(false);
    expect(result.totalUserValueInEth).toBe(0n);
  });
});

describe('computePositionHealth — RISK-3 fix: B-U clamped to zero', () => {
  // proxyUnlockedBalanceStvInEth > proxyBalanceStvInEth should not produce negative totalLockedEth
  it('totalLockedEth is 0 when unlocked > balance (defensive clamp)', () => {
    // B=50, U=80 → without clamp: locked = min(L, 50-80=-30) = -30 (breaks invariant)
    // with clamp: locked = min(L, max(0, -30)) = min(100, 0) = 0
    const result = computePositionHealth({
      ...base,
      proxyBalanceStvInEth: 50n * ETH,
      proxyUnlockedBalanceStvInEth: 80n * ETH,
      totalStethLiabilityInEth: 100n * ETH,
    });
    expect(result.totalLockedEth).toBe(0n);
    expect(result.assetShortfallInEth).toBe(100n * ETH);
    expect(result.isUnhealthy).toBe(true);
  });

  it('INVARIANT: totalLockedEth >= 0 even when unlocked > balance', () => {
    const result = computePositionHealth({
      ...base,
      proxyBalanceStvInEth: 10n * ETH,
      proxyUnlockedBalanceStvInEth: 20n * ETH,
      totalStethLiabilityInEth: 8n * ETH,
    });
    expect(result.totalLockedEth >= 0n).toBe(true);
  });
});
