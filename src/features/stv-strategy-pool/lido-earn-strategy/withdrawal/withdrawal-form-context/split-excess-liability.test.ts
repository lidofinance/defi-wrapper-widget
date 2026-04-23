import { describe, it, expect } from 'vitest';
import { splitExcessLiability } from './split-excess-liability';

const ETH = 10n ** 18n;

describe('splitExcessLiability', () => {
  it('amount fully within excess: no liability portion', () => {
    // withdrawal=2, excess=5 → ethToPayForLiability=0, stethToWithdrawForExcess=2
    const { ethToPayForLiability, stethToWithdrawForExcess } =
      splitExcessLiability(2n * ETH, 5n * ETH);
    expect(ethToPayForLiability).toBe(0n);
    expect(stethToWithdrawForExcess).toBe(2n * ETH);
  });

  it('amount exactly equals excess: boundary — full excess, no liability', () => {
    const { ethToPayForLiability, stethToWithdrawForExcess } =
      splitExcessLiability(5n * ETH, 5n * ETH);
    expect(ethToPayForLiability).toBe(0n);
    expect(stethToWithdrawForExcess).toBe(5n * ETH);
  });

  it('amount exceeds excess: splits correctly', () => {
    // withdrawal=5, excess=3 → liability=2, excess=3
    const { ethToPayForLiability, stethToWithdrawForExcess } =
      splitExcessLiability(5n * ETH, 3n * ETH);
    expect(ethToPayForLiability).toBe(2n * ETH);
    expect(stethToWithdrawForExcess).toBe(3n * ETH);
  });

  it('sum of parts equals total amount', () => {
    const amount = 7n * ETH;
    const excess = 3n * ETH;
    const { ethToPayForLiability, stethToWithdrawForExcess } =
      splitExcessLiability(amount, excess);
    expect(ethToPayForLiability + stethToWithdrawForExcess).toBe(amount);
  });

  it('zero excess: entire amount goes to liability', () => {
    const { ethToPayForLiability, stethToWithdrawForExcess } =
      splitExcessLiability(4n * ETH, 0n);
    expect(ethToPayForLiability).toBe(4n * ETH);
    expect(stethToWithdrawForExcess).toBe(0n);
  });

  it('zero amount: both outputs are zero', () => {
    const { ethToPayForLiability, stethToWithdrawForExcess } =
      splitExcessLiability(0n, 3n * ETH);
    expect(ethToPayForLiability).toBe(0n);
    expect(stethToWithdrawForExcess).toBe(0n);
  });

  it('ethToPayForLiability is never negative (clamped to zero)', () => {
    // excess >> amount
    const { ethToPayForLiability } = splitExcessLiability(1n * ETH, 100n * ETH);
    expect(ethToPayForLiability >= 0n).toBe(true);
  });

  it('stethToWithdrawForExcess is never negative', () => {
    const { stethToWithdrawForExcess } = splitExcessLiability(0n, 0n);
    expect(stethToWithdrawForExcess >= 0n).toBe(true);
  });
});
