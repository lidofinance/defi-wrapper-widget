import { describe, it, expect } from 'vitest';
import { formatBalance } from './formatBalance';

const ETH = 10n ** 18n;

describe('formatBalance', () => {
  describe('basic formatting', () => {
    it('formats a whole ETH value', () => {
      const { actual, trimmed } = formatBalance(1n * ETH);
      expect(actual).toBe('1.0');
      // viem's formatUnits strips trailing zeros ('1.0' → decimal part is '0', not '0000')
      // so trimming can only shorten, not pad — trimmed mirrors actual here
      expect(trimmed).toBe('1.0');
    });

    it('formats a fractional value', () => {
      expect(formatBalance(1_500000000000000000n).actual).toBe('1.5');
    });

    it('appends .0 when no decimal part', () => {
      expect(formatBalance(2n * ETH).actual).toBe('2.0');
    });

    it('formats zero', () => {
      const { actual, trimmed, isTrimmedRepresentZero } = formatBalance(0n);
      expect(actual).toBe('0.0');
      expect(isTrimmedRepresentZero).toBe(true);
    });

    it('defaults balance to 0n when undefined', () => {
      expect(formatBalance(undefined).actual).toBe('0.0');
    });
  });

  describe('decimal trimming', () => {
    it('trims to maxDecimalDigits', () => {
      const { trimmed, isTrimmed } = formatBalance(1_123456789000000000n, {
        maxDecimalDigits: 2,
      });
      expect(trimmed).toBe('1.12');
      expect(isTrimmed).toBe(true);
    });

    it('does not set isTrimmed when digits fit exactly', () => {
      const { isTrimmed } = formatBalance(1_500000000000000000n, {
        maxDecimalDigits: 4,
      });
      expect(isTrimmed).toBe(false);
    });

    it('appends ellipsis when trimEllipsis is set', () => {
      const { trimmed } = formatBalance(1_123456789000000000n, {
        maxDecimalDigits: 2,
        trimEllipsis: true,
      });
      expect(trimmed).toBe('1.12...');
    });

    it('maxDecimalDigits: 0 shows only integer part', () => {
      const { trimmed } = formatBalance(1_999000000000000000n, {
        maxDecimalDigits: 0,
      });
      expect(trimmed).toBe('1');
    });
  });

  describe('isTrimmedRepresentZero', () => {
    it('is true for dust that rounds to "0.0000"', () => {
      // 1 wei — 4 decimal places of 18-decimal token = 0.0000...
      const { isTrimmedRepresentZero } = formatBalance(1n, {
        maxDecimalDigits: 4,
      });
      expect(isTrimmedRepresentZero).toBe(true);
    });

    it('is false for a value that rounds to a non-zero display', () => {
      const { isTrimmedRepresentZero } = formatBalance(
        1_000000000000000n, // 0.001 ETH
        { maxDecimalDigits: 4 },
      );
      expect(isTrimmedRepresentZero).toBe(false);
    });

    it('is false for exactly 1.0', () => {
      expect(formatBalance(1n * ETH).isTrimmedRepresentZero).toBe(false);
    });
  });

  describe('maxTotalLength truncation', () => {
    it('truncates long integer parts', () => {
      const { trimmed, isTrimmed } = formatBalance(1234567n * ETH, {
        maxTotalLength: 8,
      });
      expect(trimmed.endsWith('...')).toBe(true);
      expect(isTrimmed).toBe(true);
    });

    it('drops trailing .0 cleanly when period lands at cut boundary', () => {
      // "12345.0" length=7, maxTotalLength=9 → trimmed[5]='.' → slice to "12345", no ellipsis
      const { trimmed, isTrimmed } = formatBalance(12345n * ETH, {
        maxTotalLength: 9,
      });
      expect(trimmed).toBe('12345');
      expect(isTrimmed).toBe(false);
    });
  });

  describe('negative bigints — OBS-16 coverage (totalUserValueInEth under Mellow loss)', () => {
    it('formats a negative ETH value without crashing', () => {
      const { actual, trimmed } = formatBalance(-1n * ETH);
      expect(actual).toContain('-');
      expect(trimmed).toContain('-');
    });

    it('formats -0.1 ETH correctly', () => {
      const { actual } = formatBalance(-100000000000000000n);
      expect(actual).toBe('-0.1');
    });

    it('isTrimmedRepresentZero is false for negative values (minus sign is not "0")', () => {
      // Even "-0.0000" should be false because it contains '-'
      const { isTrimmedRepresentZero } = formatBalance(-1n, {
        maxDecimalDigits: 4,
      });
      expect(isTrimmedRepresentZero).toBe(false);
    });

    it('formatBalance handles large negative values', () => {
      const { actual } = formatBalance(-5n * ETH);
      expect(actual).toBe('-5.0');
    });
  });

  describe('adaptiveDecimals', () => {
    it('shows enough digits to reveal the first non-zero decimal', () => {
      const { trimmed } = formatBalance(1_000100000000000000n, {
        maxDecimalDigits: 4,
        adaptiveDecimals: true,
      });
      // 0.0001 — first non-zero at index 3, should show at least 4 places
      expect(trimmed).toContain('0001');
    });
  });

  describe('custom token decimals', () => {
    it('handles 6-decimal tokens (USDC-like)', () => {
      const { actual } = formatBalance(1_500000n, { tokenDecimals: 6 });
      expect(actual).toBe('1.5');
    });
  });
});
