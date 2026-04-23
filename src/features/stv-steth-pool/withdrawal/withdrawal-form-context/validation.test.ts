import { describe, it, expect } from 'vitest';
import type { CalcWithdrawalRepayRebalanceRatio } from '@/modules/defi-wrapper';
import { withdrawalFormValidationSchema } from './validation';

const ETH = 10n ** 18n;

// identity: withdrawalValue equals input amount (no rebalance eats into it)
const identityCalc: CalcWithdrawalRepayRebalanceRatio = (value) => ({
  withdrawalValue: value,
  repayableStethShares: 0n,
  repayableWsteth: 0n,
  repayableSteth: 0n,
  rebalancableStethShares: 0n,
  rebalancableSteth: 0n,
  rebalancableValue: 0n,
});

// half: withdrawalValue = amount/2 (rebalance consumes half the withdrawal)
const halfCalc: CalcWithdrawalRepayRebalanceRatio = (value) => ({
  withdrawalValue: value / 2n,
  repayableStethShares: 0n,
  repayableWsteth: 0n,
  repayableSteth: 0n,
  rebalancableStethShares: 0n,
  rebalancableSteth: 0n,
  rebalancableValue: value / 2n,
});

const base = {
  balanceInEth: 10n * ETH,
  maxWithdrawalInEth: null,
  minWithdrawalInEth: null,
  calcWithdrawalRepayRebalanceRatio: identityCalc,
} as {
  balanceInEth: bigint;
  maxWithdrawalInEth: bigint | null;
  minWithdrawalInEth: bigint | null;
  calcWithdrawalRepayRebalanceRatio?: CalcWithdrawalRepayRebalanceRatio;
};

const parse = (
  ctx: typeof base,
  values: { token: string; amount: unknown; repayToken: string },
) => withdrawalFormValidationSchema('STETH', ctx as never).safeParse(values);

describe('withdrawalFormValidationSchema (StvStETHPool)', () => {
  describe('token fields', () => {
    it('ETH + STETH repayToken passes', () => {
      expect(
        parse(base, { token: 'ETH', amount: 1n * ETH, repayToken: 'STETH' })
          .success,
      ).toBe(true);
    });

    it('ETH + WSTETH repayToken passes', () => {
      const schema = withdrawalFormValidationSchema(
        'WSTETH',
        base as never,
      ).safeParse({ token: 'ETH', amount: 1n * ETH, repayToken: 'WSTETH' });
      expect(schema.success).toBe(true);
    });

    it('non-ETH token fails', () => {
      expect(
        parse(base, { token: 'WETH', amount: 1n * ETH, repayToken: 'STETH' })
          .success,
      ).toBe(false);
    });

    it('invalid repayToken fails', () => {
      expect(
        parse(base, { token: 'ETH', amount: 1n * ETH, repayToken: 'ETH' })
          .success,
      ).toBe(false);
    });
  });

  describe('balance cap', () => {
    it('amount at balance passes', () => {
      expect(
        parse(base, { token: 'ETH', amount: 10n * ETH, repayToken: 'STETH' })
          .success,
      ).toBe(true);
    });

    it('amount above balance fails', () => {
      expect(
        parse(base, { token: 'ETH', amount: 11n * ETH, repayToken: 'STETH' })
          .success,
      ).toBe(false);
    });
  });

  describe('minWithdrawalInEth = null (skip min checks)', () => {
    it('any positive amount passes (no 100 wei floor unlike earn strategy)', () => {
      expect(
        parse(base, { token: 'ETH', amount: 1n, repayToken: 'STETH' }).success,
      ).toBe(true);
    });
  });

  describe('minWithdrawalInEth basic gte check', () => {
    it('amount at minimum passes', () => {
      const ctx = { ...base, minWithdrawalInEth: 1n * ETH };
      expect(
        parse(ctx as any, {
          token: 'ETH',
          amount: 1n * ETH,
          repayToken: 'STETH',
        }).success,
      ).toBe(true);
    });

    it('amount below minimum fails with limit message', () => {
      const ctx = { ...base, minWithdrawalInEth: 1n * ETH };
      const result = parse(ctx as any, {
        token: 'ETH',
        amount: ETH / 2n,
        repayToken: 'STETH',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Below minimum withdrawal limit',
        );
      }
    });
  });

  describe('refine: withdrawalValue after rebalance must meet minimum', () => {
    it('passes when withdrawalValue >= min (identity calc)', () => {
      // amount=2, min=1, withdrawalValue=2 → passes
      const ctx = { ...base, minWithdrawalInEth: 1n * ETH };
      expect(
        parse(ctx as any, {
          token: 'ETH',
          amount: 2n * ETH,
          repayToken: 'STETH',
        }).success,
      ).toBe(true);
    });

    it('fails when rebalance eats withdrawal below minimum', () => {
      // amount=2*ETH, min=1.5*ETH, halfCalc returns withdrawalValue=1*ETH → 1*ETH < 1.5*ETH → fail
      const ctx = {
        ...base,
        minWithdrawalInEth: (3n * ETH) / 2n,
        calcWithdrawalRepayRebalanceRatio: halfCalc,
      };
      const result = parse(ctx, {
        token: 'ETH',
        amount: 2n * ETH,
        repayToken: 'STETH',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'less then minimum allowed withdrawable value',
        );
      }
    });

    it('refine is skipped when minWithdrawalInEth is null', () => {
      // halfCalc is provided but refine should never run
      const ctx = { ...base, calcWithdrawalRepayRebalanceRatio: halfCalc };
      expect(
        parse(ctx, { token: 'ETH', amount: 1n, repayToken: 'STETH' }).success,
      ).toBe(true);
    });
  });
});
