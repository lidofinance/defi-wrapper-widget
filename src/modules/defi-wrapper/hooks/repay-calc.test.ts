import { describe, it, expect } from 'vitest';
import { buildRepayCalc } from './repay-calc';

const ETH = 10n ** 18n;

// 1:1 stETH/shares rate, 10% reserve ratio, 2 stETH STETH balance, 0 wstETH
const makeCalc = (overrides?: Partial<Parameters<typeof buildRepayCalc>[0]>) =>
  buildRepayCalc({
    lidoShares: { totalShares: 1000n * ETH, totalEther: 1000n * ETH },
    poolReserveRatioBP: 1000n, // 10%
    sharesBalance: 2n * ETH,
    wstETHBalance: 0n,
    unlockedAssets: ETH / 2n, // 0.5 ETH unlocked
    mintedStethShares: 5n * ETH,
    exceedingLiability: 0n,
    ...overrides,
  });

describe('buildRepayCalc — within unlocked range', () => {
  it('no repay/rebalance when amount <= unlockedAssets', () => {
    const calc = makeCalc();
    const r = calc(ETH / 4n, 'STETH'); // 0.25 ETH < 0.5 unlocked
    expect(r.repayableStethShares).toBe(0n);
    expect(r.rebalancableStethShares).toBe(0n);
    expect(r.withdrawalValue).toBe(ETH / 4n);
  });

  it('at exact unlocked boundary: no repay (amountToUnlock = 0)', () => {
    const calc = makeCalc();
    const r = calc(ETH / 2n, 'STETH'); // exactly 0.5 ETH
    expect(r.repayableStethShares).toBe(0n);
    expect(r.withdrawalValue).toBe(ETH / 2n);
  });
});

describe('buildRepayCalc — exceeds unlocked, STETH balance sufficient', () => {
  // amount=1 ETH, unlocked=0.5 → amountToUnlock=0.5
  // sharesToRepay = (0.5 * 9000/10000) = 0.45 ETH (1:1 rate)
  // sharesBalance=2 ETH covers 0.45 → rebalancable=0, withdrawalValue=amount
  it('full repay from STETH balance, no rebalance', () => {
    const calc = makeCalc();
    const r = calc(1n * ETH, 'STETH');
    expect(r.repayableStethShares).toBe(45n * ETH / 100n);
    expect(r.rebalancableStethShares).toBe(0n);
    expect(r.withdrawalValue).toBe(1n * ETH);
  });

  it('repayableStethShares + rebalancableStethShares = sharesToRepay', () => {
    const calc = makeCalc();
    const r = calc(1n * ETH, 'STETH');
    const sharesToRepay = 45n * ETH / 100n; // 0.45 ETH (1:1, 10% RR)
    expect(r.repayableStethShares + r.rebalancableStethShares).toBe(sharesToRepay);
  });
});

describe('buildRepayCalc — exceeds unlocked, balance zero (full rebalance)', () => {
  // sharesBalance=0, wstETH=0 → all liability goes to rebalance
  // amount=1.5 ETH, unlocked=0.5 → amountToUnlock=1 ETH
  // sharesToRepay = 1 * 0.9 = 0.9 ETH (1:1, 10% RR)
  // repayable=0, rebalancable=0.9 ETH, rebalancableValue=0.9 ETH
  // withdrawalValue = max(0, 1.5 - 0.9) = 0.6 ETH
  const calc = makeCalc({ sharesBalance: 0n, wstETHBalance: 0n });

  it('repayableStethShares is 0 when no balance', () => {
    const r = calc((3n * ETH) / 2n, 'STETH');
    expect(r.repayableStethShares).toBe(0n);
  });

  it('rebalancableStethShares covers entire liability share', () => {
    const r = calc((3n * ETH) / 2n, 'STETH');
    expect(r.rebalancableStethShares).toBe((9n * ETH) / 10n);
  });

  it('withdrawalValue is reduced by rebalancableValue', () => {
    const r = calc((3n * ETH) / 2n, 'STETH');
    expect(r.withdrawalValue).toBe((3n * ETH) / 5n); // 0.6 ETH
  });

  it('withdrawalValue is never negative (clamped)', () => {
    // amount smaller than rebalancableValue → should clamp to 0
    const r = calc(ETH / 10n, 'STETH'); // 0.1 ETH
    expect(r.withdrawalValue >= 0n).toBe(true);
  });
});

describe('buildRepayCalc — WSTETH repay token', () => {
  it('uses wstethBalanceConvertedToShares as repayable cap when WSTETH', () => {
    // wstETH=1 ETH, sharesBalance=0 STETH
    // At 1:1 rate, wstethConverted=1 ETH → repayable from wstETH
    const calc = makeCalc({ sharesBalance: 0n, wstETHBalance: 1n * ETH });
    const r = calc(1n * ETH, 'WSTETH');
    // sharesToRepay = (0.5 * 0.9) = 0.45 ETH
    expect(r.repayableStethShares).toBe(45n * ETH / 100n);
    expect(r.rebalancableStethShares).toBe(0n);
  });
});

describe('buildRepayCalc — exceedingLiability adds to repay requirement', () => {
  it('exceedingLiability increases sharesToRepay', () => {
    // Without excess: sharesToRepay = 0.45 ETH
    // With 0.1 exceedingLiability: sharesToRepay = 0.55 ETH
    const noExcess = makeCalc({ exceedingLiability: 0n });
    const withExcess = makeCalc({ exceedingLiability: ETH / 10n });

    const rNo = noExcess(1n * ETH, 'STETH');
    const rWith = withExcess(1n * ETH, 'STETH');

    expect(rWith.repayableStethShares).toBeGreaterThan(rNo.repayableStethShares);
  });
});

describe('buildRepayCalc — mintedStethShares cap', () => {
  it('sharesToRepay is capped by mintedStethShares', () => {
    // mintedStethShares = 0.1 ETH (very small liability)
    // Without cap it would be 0.45 ETH → gets capped to 0.1
    const calc = makeCalc({ mintedStethShares: ETH / 10n });
    const r = calc(1n * ETH, 'STETH');
    expect(r.repayableStethShares).toBe(ETH / 10n);
  });
});

describe('buildRepayCalc — MEDIUM-6: stale strategyVaultStethExcess effect', () => {
  it.todo(
    // MEDIUM-6: stale positionData.strategyVaultStethExcess in use-withdraw-strategy.ts
    // When fix is applied (fresh read inside transactions()), this test becomes:
    // "transactions() uses freshExcess not staleExcess from closure"
    // Requires React hook mount + wagmi mock — L4 test infrastructure needed.
    'transactions() re-fetches strategyVaultStethExcess at signing time (requires L4 hook mock)',
  );
});

describe('buildRepayCalc — LOW-14: stale stvToWithdraw effect', () => {
  it.todo(
    // LOW-14: use-process-withdrawal.ts uses stale stvToWithdraw from WithdrawalToProcessParams
    // When fix is applied (fresh read inside transactions()), this test becomes:
    // "requestWithdrawalFromPool uses fresh unlockedStvOf() not stale stvToWithdraw"
    // Requires React hook mount + wagmi mock — L4 test infrastructure needed.
    'transactions() re-fetches stvToWithdraw from unlockedStvOf at signing time (requires L4 hook mock)',
  );
});
