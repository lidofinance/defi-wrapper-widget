import { describe, it, expect } from 'vitest';
import {
  clampZeroBN,
  minBN,
  maxBN,
  bnCeilDiv,
  divideBN,
  factorMulBN,
  numberToBN,
  bnAmountToNumber,
  absBN,
  signBN,
  isEqualEpsilonBN,
} from './bn';

const ETH = 10n ** 18n;

describe('clampZeroBN', () => {
  it('passes through positive value', () => expect(clampZeroBN(5n)).toBe(5n));
  it('passes through zero', () => expect(clampZeroBN(0n)).toBe(0n));
  it('clamps negative to zero', () => expect(clampZeroBN(-1n)).toBe(0n));
  it('clamps large negative to zero', () =>
    expect(clampZeroBN(-1_000000000000000000n)).toBe(0n));

  // position calc coverage: totalLockedEth, withdrawableEthAfterRepay use this
  it('clamps -1n (common rounding dust) to zero', () =>
    expect(clampZeroBN(-1n)).toBe(0n));
});

describe('minBN', () => {
  it('returns minimum of two values', () => expect(minBN(3n, 1n)).toBe(1n));
  it('returns minimum of three values', () =>
    expect(minBN(3n, 1n, 2n)).toBe(1n));
  it('returns single value', () => expect(minBN(7n)).toBe(7n));
  it('filters out null', () => expect(minBN(null, 5n, 3n)).toBe(3n));
  it('filters out undefined', () => expect(minBN(undefined, 5n, 3n)).toBe(3n));
  it('filters mixed null and undefined', () =>
    expect(minBN(null, 5n, undefined, 3n)).toBe(3n));
  it('throws when all values are null or undefined', () =>
    expect(() => minBN(null, undefined)).toThrow());
  it('handles zero correctly', () => expect(minBN(0n, 1n)).toBe(0n));
  it('handles negative values', () => expect(minBN(-1n, 1n)).toBe(-1n));
});

describe('maxBN', () => {
  it('returns maximum of two values', () => expect(maxBN(3n, 1n)).toBe(3n));
  it('returns maximum of three values', () =>
    expect(maxBN(3n, 1n, 5n)).toBe(5n));
  it('filters out null', () => expect(maxBN(null, 5n, 3n)).toBe(5n));
  it('throws when all values are null or undefined', () =>
    expect(() => maxBN(undefined)).toThrow());
  it('handles negative values', () => expect(maxBN(-5n, -1n)).toBe(-1n));
});

describe('bnCeilDiv', () => {
  it('exact division returns quotient without rounding', () =>
    expect(bnCeilDiv(6n, 3n)).toBe(2n));
  it('rounds up when remainder exists', () =>
    expect(bnCeilDiv(7n, 3n)).toBe(3n));
  it('rounds up for 1 remainder', () => expect(bnCeilDiv(4n, 3n)).toBe(2n));
  it('throws on zero denominator', () =>
    expect(() => bnCeilDiv(1n, 0n)).toThrow());
  it('handles large ETH-scale values', () => {
    // 1.5 ETH / 1 ETH = ceiling(1.5) = 2 in integer math
    expect(bnCeilDiv(15n * ETH / 10n, ETH)).toBe(2n);
  });
  it('1n / 1n = 1n', () => expect(bnCeilDiv(1n, 1n)).toBe(1n));
  it('0n / anything = 0n', () => expect(bnCeilDiv(0n, 5n)).toBe(0n));
});

describe('divideBN', () => {
  it('divides with default 18-decimal precision', () => {
    // 1 ETH / 2 ETH = 0.5, represented as 5 * 10^17
    expect(divideBN(1n * ETH, 2n * ETH)).toBe(5n * 10n ** 17n);
  });

  it('divides with custom precision', () => {
    expect(divideBN(1n, 4n, 2)).toBe(25n); // 0.25 * 10^2
  });

  it('throws on zero denominator', () =>
    expect(() => divideBN(1n, 0n)).toThrow());
});

describe('factorMulBN', () => {
  it('multiplies bigint by a number factor', () => {
    // 1 ETH * 0.5 = 0.5 ETH
    const result = factorMulBN(1n * ETH, 0.5);
    expect(result).toBe(5n * 10n ** 17n);
  });

  it('factor of 1 returns original value', () => {
    expect(factorMulBN(1n * ETH, 1)).toBe(1n * ETH);
  });

  it('factor of 0 returns 0n', () => {
    expect(factorMulBN(1n * ETH, 0)).toBe(0n);
  });
});

describe('numberToBN', () => {
  it('converts 1.5 to 1.5 ETH representation', () => {
    expect(numberToBN(1.5)).toBe(1_500000000000000000n);
  });

  it('converts 0 to 0n', () => {
    expect(numberToBN(0)).toBe(0n);
  });

  it('floors fractional results', () => {
    // 1.9999... should floor, not round
    expect(numberToBN(1, 0)).toBe(1n);
  });

  it('throws on Infinity', () =>
    expect(() => numberToBN(Infinity)).toThrow());
  it('throws on -Infinity', () =>
    expect(() => numberToBN(-Infinity)).toThrow());
  it('throws on NaN', () => expect(() => numberToBN(NaN)).toThrow());
});

describe('bnAmountToNumber', () => {
  it('converts 1 ETH to 1', () => {
    expect(bnAmountToNumber(1n * ETH)).toBe(1);
  });

  it('converts 0.5 ETH to 0.5', () => {
    expect(bnAmountToNumber(5n * 10n ** 17n)).toBe(0.5);
  });

  it('returns NaN for undefined (caller must guard)', () => {
    // Number(undefined) = NaN — function does not guard; callers should check
    expect(bnAmountToNumber(undefined)).toBeNaN();
  });

  it('returns 0 for null (Number(null) === 0)', () => {
    expect(bnAmountToNumber(null)).toBe(0);
  });
});

describe('absBN', () => {
  it('positive value unchanged', () => expect(absBN(5n)).toBe(5n));
  it('zero unchanged', () => expect(absBN(0n)).toBe(0n));
  it('negates negative value', () => expect(absBN(-5n)).toBe(5n));
});

describe('signBN', () => {
  it('positive returns 1n', () => expect(signBN(5n)).toBe(1n));
  it('zero returns 0n', () => expect(signBN(0n)).toBe(0n));
  it('negative returns -1n', () => expect(signBN(-5n)).toBe(-1n));
});

describe('isEqualEpsilonBN', () => {
  it('equal values are within epsilon', () =>
    expect(isEqualEpsilonBN(100n, 100n)).toBe(true));
  it('values within default epsilon (1000n) are equal', () =>
    expect(isEqualEpsilonBN(100n, 1099n)).toBe(true));
  it('values at epsilon boundary are NOT equal', () =>
    // diff = 1000, which is NOT < 1000
    expect(isEqualEpsilonBN(0n, 1000n)).toBe(false));
  it('values beyond epsilon are not equal', () =>
    expect(isEqualEpsilonBN(0n, 2000n)).toBe(false));
  it('works with custom epsilon', () =>
    expect(isEqualEpsilonBN(0n, 5n, 10n)).toBe(true));
  it('works for negative difference', () =>
    expect(isEqualEpsilonBN(1000n, 100n)).toBe(true));
});
