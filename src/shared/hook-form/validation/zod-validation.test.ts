import { describe, it, expect } from 'vitest';
import { tokenAmountSchema } from './zod-validation';

const ETH = 10n ** 18n;

describe('tokenAmountSchema', () => {
  describe('balance cap', () => {
    it('amount at balance passes', () => {
      const result = tokenAmountSchema(10n * ETH).safeParse(10n * ETH);
      expect(result.success).toBe(true);
    });

    it('amount above balance fails', () => {
      const result = tokenAmountSchema(10n * ETH).safeParse(11n * ETH);
      expect(result.success).toBe(false);
    });

    it('amount below balance passes', () => {
      const result = tokenAmountSchema(10n * ETH).safeParse(5n * ETH);
      expect(result.success).toBe(true);
    });
  });

  describe('zero and non-bigint', () => {
    it('amount = 0n fails (must be > 0)', () => {
      const result = tokenAmountSchema(10n * ETH).safeParse(0n);
      expect(result.success).toBe(false);
    });

    it('amount = 1n passes (minimum positive)', () => {
      const result = tokenAmountSchema(10n * ETH).safeParse(1n);
      expect(result.success).toBe(true);
    });

    it('non-bigint (number) fails', () => {
      const result = tokenAmountSchema(10n * ETH).safeParse(1);
      expect(result.success).toBe(false);
    });
  });

  describe('optional maxAmount cap', () => {
    it('amount at maxAmount passes', () => {
      const result = tokenAmountSchema(10n * ETH, 5n * ETH).safeParse(5n * ETH);
      expect(result.success).toBe(true);
    });

    it('amount above maxAmount fails with default message', () => {
      const result = tokenAmountSchema(10n * ETH, 5n * ETH).safeParse(6n * ETH);
      expect(result.success).toBe(false);
    });

    it('amount above maxAmount fails with custom message', () => {
      const result = tokenAmountSchema(
        10n * ETH,
        5n * ETH,
        'Custom limit error',
      ).safeParse(6n * ETH);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Custom limit error');
      }
    });

    it('maxAmount = undefined disables extra cap', () => {
      const result = tokenAmountSchema(10n * ETH, undefined).safeParse(10n * ETH);
      expect(result.success).toBe(true);
    });
  });
});
