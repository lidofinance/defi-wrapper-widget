import { describe, it, expect } from 'vitest';
import { aprToApy, apyToApr } from './apr-to-apy';

describe('aprToApy', () => {
  it('APY is greater than APR for positive rates (compounding)', () => {
    expect(aprToApy(6)).toBeGreaterThan(6);
    expect(aprToApy(10)).toBeGreaterThan(10);
  });

  it('zero APR gives zero APY', () => {
    expect(aprToApy(0)).toBe(0);
  });

  it('known value: 10% APR ≈ 10.516% APY (daily compounding)', () => {
    // (1 + 0.10/365)^365 - 1 ≈ 0.10516
    expect(aprToApy(10)).toBeCloseTo(10.516, 2);
  });
});

describe('apyToApr', () => {
  it('APR is less than APY for positive rates', () => {
    expect(apyToApr(10)).toBeLessThan(10);
  });

  it('zero APY gives zero APR', () => {
    expect(apyToApr(0)).toBe(0);
  });
});

describe('aprToApy / apyToApr roundtrip', () => {
  it('are inverses of each other', () => {
    expect(aprToApy(apyToApr(8))).toBeCloseTo(8, 8);
    expect(apyToApr(aprToApy(8))).toBeCloseTo(8, 8);
  });

  it('roundtrip holds for typical DeFi rates (0–30%)', () => {
    for (const rate of [1, 3, 5, 8, 12, 20, 30]) {
      expect(aprToApy(apyToApr(rate))).toBeCloseTo(rate, 6);
      expect(apyToApr(aprToApy(rate))).toBeCloseTo(rate, 6);
    }
  });
});

// MEDIUM-9 regression: Mellow API returns APY; the old code called aprToApy(mellowApy)
// instead of apyToApr(mellowApy), overstating APY shown to users by ~0.3–0.5%.
describe('MEDIUM-9 regression: wrong direction inflates displayed APY', () => {
  it('aprToApy(mellowApy) overstates relative to apyToApr(mellowApy)', () => {
    const mellowApy = 8; // percent — what Mellow API returns

    const correctApr = apyToApr(mellowApy); // correct: convert APY → APR for calculateStrategyApy
    const wrongApr = aprToApy(mellowApy); // old bug: treated APY as APR, converted "up" again

    expect(wrongApr).toBeGreaterThan(correctApr);
  });

  it('overstatement grows with APY — always positive and measurable', () => {
    // The raw delta between aprToApy(x) and apyToApr(x) is ~0.16% at 4% APY
    // and grows to ~1.4% at 12% APY. The final displayed overstatement after
    // calculateStrategyApy (multiplied by utilization) is larger.
    for (const mellowApy of [4, 6, 8, 10, 12]) {
      const correctApr = apyToApr(mellowApy);
      const wrongApr = aprToApy(mellowApy);
      expect(wrongApr - correctApr).toBeGreaterThan(0);
    }
  });

  it('overstatement exceeds 0.5% for high Mellow yields (>=8%)', () => {
    for (const mellowApy of [8, 10, 12]) {
      const correctApr = apyToApr(mellowApy);
      const wrongApr = aprToApy(mellowApy);
      expect(wrongApr - correctApr).toBeGreaterThan(0.5);
    }
  });
});
