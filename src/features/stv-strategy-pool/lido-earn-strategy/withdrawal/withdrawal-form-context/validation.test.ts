import { describe, it, expect } from 'vitest';
import { withdrawalFormValidationSchema } from './validation';

const ETH = 10n ** 18n;

const base = {
  balanceInEth: 10n * ETH,
  maxWithdrawalInEth: null,
  minWithdrawalInEth: null,
};

const parse = (ctx: typeof base, values: { token: string; amount: unknown }) =>
  withdrawalFormValidationSchema(ctx as never).safeParse(values);

describe('withdrawalFormValidationSchema (earn strategy)', () => {
  describe('token field', () => {
    it('ETH token passes', () => {
      expect(parse(base, { token: 'ETH', amount: 1n * ETH }).success).toBe(
        true,
      );
    });

    it('non-ETH token fails', () => {
      expect(parse(base, { token: 'WETH', amount: 1n * ETH }).success).toBe(
        false,
      );
    });
  });

  describe('balance cap', () => {
    it('amount at balance passes', () => {
      expect(parse(base, { token: 'ETH', amount: 10n * ETH }).success).toBe(
        true,
      );
    });

    it('amount above balance fails', () => {
      expect(parse(base, { token: 'ETH', amount: 11n * ETH }).success).toBe(
        false,
      );
    });
  });

  describe('minimum 100 wei floor', () => {
    it('99n fails (below hard floor)', () => {
      expect(parse(base, { token: 'ETH', amount: 99n }).success).toBe(false);
    });

    it('100n passes (at hard floor)', () => {
      expect(parse(base, { token: 'ETH', amount: 100n }).success).toBe(true);
    });
  });

  describe('optional maxWithdrawalInEth', () => {
    it('amount at maxWithdrawal passes', () => {
      const ctx = { ...base, maxWithdrawalInEth: 5n * ETH };
      expect(
        parse(ctx as any, { token: 'ETH', amount: 5n * ETH }).success,
      ).toBe(true);
    });

    it('amount above maxWithdrawal fails with limit message', () => {
      const ctx = { ...base, maxWithdrawalInEth: 5n * ETH };
      const result = parse(ctx as any, { token: 'ETH', amount: 6n * ETH });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Exceeds maximum withdrawal limit',
        );
      }
    });
  });

  describe('optional minWithdrawalInEth', () => {
    it('null minWithdrawalInEth skips the check', () => {
      expect(parse(base, { token: 'ETH', amount: 100n }).success).toBe(true);
    });

    it('amount at minWithdrawal passes', () => {
      const ctx = { ...base, minWithdrawalInEth: 1n * ETH };
      expect(
        parse(ctx as any, { token: 'ETH', amount: 1n * ETH }).success,
      ).toBe(true);
    });

    it('amount below minWithdrawal fails', () => {
      const ctx = { ...base, minWithdrawalInEth: 1n * ETH };
      const result = parse(ctx as any, { token: 'ETH', amount: ETH / 2n });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Below minimum withdrawal limit',
        );
      }
    });
  });
});
