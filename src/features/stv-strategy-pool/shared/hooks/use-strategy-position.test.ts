/* eslint-disable import/order */
/* eslint-disable func-style */
import type { Address } from 'viem';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStrategyPosition } from './use-strategy-position';

vi.mock('@/modules/defi-wrapper', () => ({ useStvStrategy: vi.fn() }));
vi.mock('@/modules/vaults', () => ({
  readWithReport: vi.fn(),
  useVault: vi.fn(),
}));
vi.mock('@/modules/web3', () => ({
  useDappStatus: vi.fn(),
  useLidoSDK: vi.fn(),
}));

import { readWithReport } from '@/modules/vaults';
const mockRWR = vi.mocked(readWithReport);

const PROXY = '0x1111111111111111111111111111111111111111' as Address;
const USER = '0x2222222222222222222222222222222222222222' as Address;
const WSTETH = '0x3333333333333333333333333333333333333333' as Address;

// readWithReport destructuring order:
// [proxyBalanceStvInEth, proxyNominalBalanceStvInEth, proxyUnlockedBalanceStvInEth,
//  unlockedStv, strategyDepositOffsetInLockedEth, totalStethLiabilityInEth,
//  totalStethSharesAvailableForReturnInEth, withdrawableStvAfterRepay,
//  withdrawableEthAfterRepay, pendingUnlockFromStrategyVaultInEth,
//  currentProxyMintingCapacityShares, currentVaultMintingCapacityShares]
type RWR = {
  proxyBalanceStvInEth?: bigint;
  proxyNominalBalanceStvInEth?: bigint;
  proxyUnlockedBalanceStvInEth?: bigint;
  unlockedStv?: bigint;
  strategyDepositOffsetInLockedEth?: bigint;
  totalStethLiabilityInEth?: bigint;
  totalStethSharesAvailableForReturnInEth?: bigint;
  withdrawableStvAfterRepay?: bigint;
  withdrawableEthAfterRepay?: bigint;
  pendingUnlockFromStrategyVaultInEth?: bigint;
  currentProxyMintingCapacityShares?: bigint;
  currentVaultMintingCapacityShares?: bigint;
};

// convertBatchSharesToSteth destructuring order:
// [totalStrategyBalanceInSteth, stethOnBalance, totalMintedSteth, strategyVaultStethExcess,
//  totalStethDifference, totalStethToRepay, stethToRepay, stethToRebalance,
//  stethToRecover, stethToRecoverPendingFromStrategyVault]
type Batch = {
  totalStrategyBalanceInSteth?: bigint;
  stethOnBalance?: bigint;
  totalMintedSteth?: bigint;
  strategyVaultStethExcess?: bigint;
  totalStethDifference?: bigint;
  totalStethToRepay?: bigint;
  stethToRepay?: bigint;
  stethToRebalance?: bigint;
  stethToRecover?: bigint;
  stethToRecoverPendingFromStrategyVault?: bigint;
};

type FixtureInput = {
  S_ret?: bigint; // stethSharesOnBalance (returned stETH on proxy)
  S_mint_user?: bigint; // totalMintedStethSharesPerUserAccounting
  S_pool?: bigint; // totalPoolLiabilitySharesPerPoolAccounting
  S_vault?: bigint; // strategyStethSharesBalance (in vault now)
  S_dep?: bigint; // strategyDepositStethSharesOffset (inflight deposit)
  S_wdraw?: bigint; // strategyWithdrawalStethSharesOffset (inflight withdrawal)
  proxyBalanceStv?: bigint;
  reserveRatioBP?: bigint;
  lidoCoreMax?: bigint;
  lidoCoreCurrentMinted?: bigint;
  isConnected?: boolean;
  rwr?: RWR;
  batch?: Batch;
};

function buildFixture(opts: FixtureInput = {}) {
  const {
    S_ret = 0n,
    S_mint_user = 0n,
    S_pool = 0n,
    S_vault = 0n,
    S_dep = 0n,
    S_wdraw = 0n,
    proxyBalanceStv = 0n,
    reserveRatioBP = 1000n,
    lidoCoreMax = 1_000_000n,
    lidoCoreCurrentMinted = 0n,
    isConnected = true,
    rwr = {},
    batch = {},
  } = opts;

  const rwrArray = [
    rwr.proxyBalanceStvInEth ?? 0n,
    rwr.proxyNominalBalanceStvInEth ?? 0n,
    rwr.proxyUnlockedBalanceStvInEth ?? 0n,
    rwr.unlockedStv ?? 0n,
    rwr.strategyDepositOffsetInLockedEth ?? 0n,
    rwr.totalStethLiabilityInEth ?? 0n,
    rwr.totalStethSharesAvailableForReturnInEth ?? 0n,
    rwr.withdrawableStvAfterRepay ?? 0n,
    rwr.withdrawableEthAfterRepay ?? 0n,
    rwr.pendingUnlockFromStrategyVaultInEth ?? 0n,
    rwr.currentProxyMintingCapacityShares ?? 1_000_000n,
    rwr.currentVaultMintingCapacityShares ?? 1_000_000n,
  ];

  const batchArray = [
    batch.totalStrategyBalanceInSteth ?? 0n,
    batch.stethOnBalance ?? 0n,
    batch.totalMintedSteth ?? 0n,
    batch.strategyVaultStethExcess ?? 0n,
    batch.totalStethDifference ?? 0n,
    batch.totalStethToRepay ?? 0n,
    batch.stethToRepay ?? 0n,
    batch.stethToRebalance ?? 0n,
    batch.stethToRecover ?? 0n,
    batch.stethToRecoverPendingFromStrategyVault ?? 0n,
  ];

  const lidoV3 = {
    read: {
      getMaxMintableExternalShares: vi.fn().mockResolvedValue(lidoCoreMax),
      getExternalShares: vi.fn().mockResolvedValue(lidoCoreCurrentMinted),
    },
  };

  const shares = {
    core: { getLidoContract: vi.fn().mockResolvedValue(lidoV3) },
    // wstETH unwrap roundtrip: default identity (no rounding loss)
    convertToSteth: vi.fn().mockImplementation(async (x: bigint) => x),
    convertToShares: vi.fn().mockImplementation(async (x: bigint) => x),
    convertBatchSharesToSteth: vi.fn().mockResolvedValue(batchArray),
  };

  const unlockedStvOfSpy = vi.fn().mockReturnValue({});
  const wrapper = {
    read: {
      balanceOf: vi.fn().mockResolvedValue(proxyBalanceStv),
      poolReserveRatioBP: vi.fn().mockResolvedValue(reserveRatioBP),
      totalLiabilityShares: vi.fn().mockResolvedValue(S_pool),
    },
    prepare: {
      assetsOf: vi.fn().mockReturnValue({}),
      nominalAssetsOf: vi.fn().mockReturnValue({}),
      unlockedAssetsOf: vi.fn().mockReturnValue({}),
      unlockedStvOf: unlockedStvOfSpy,
      calcAssetsToLockForStethShares: vi.fn().mockReturnValue({}),
      remainingMintingCapacitySharesOf: vi.fn().mockReturnValue({}),
    },
  };

  const strategy = {
    read: {
      wstethOf: vi.fn().mockResolvedValue(S_ret),
      mintedStethSharesOf: vi.fn().mockResolvedValue(S_mint_user),
      WSTETH: vi.fn().mockResolvedValue(WSTETH),
    },
  };

  const dashboard = {
    prepare: { remainingMintingCapacityShares: vi.fn().mockReturnValue({}) },
  };

  mockRWR.mockResolvedValue(rwrArray as any);

  const params = {
    publicClient: {} as any,
    strategy,
    address: USER,
    activeVault: { isConnected, report: undefined } as any,
    shares,
    wrapper,
    dashboard,
    strategyProxyAddress: PROXY,
    strategyStethSharesBalance: S_vault,
    strategyDepositStethSharesOffset: S_dep,
    strategyWithdrawalStethSharesOffset: S_wdraw,
  } as any;

  return { params, shares, wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Phase 1: Pool liability cap ─────────────────────────────────────────────

describe('pool liability cap (Phase 1)', () => {
  it('caps user mint to pool total when user accounting is higher', async () => {
    // S_mint = min(500, 100) = 100
    const { params } = buildFixture({ S_mint_user: 500n, S_pool: 100n });
    const r = await getStrategyPosition(params);
    expect(r.totalMintedStethShares).toBe(100n);
  });

  it('uses user mint when below pool total', async () => {
    const { params } = buildFixture({ S_mint_user: 80n, S_pool: 100n });
    const r = await getStrategyPosition(params);
    expect(r.totalMintedStethShares).toBe(80n);
  });

  it('sets S_mint to zero when vault is disconnected', async () => {
    const { params } = buildFixture({
      S_mint_user: 200n,
      S_pool: 200n,
      isConnected: false,
    });
    const r = await getStrategyPosition(params);
    expect(r.totalMintedStethShares).toBe(0n);
  });
});

// ─── Phase 2: Total strategy balance ─────────────────────────────────────────

describe('total strategy balance (Phase 2)', () => {
  it('sums vault + pending deposit + pending withdrawal', async () => {
    const { params } = buildFixture({
      S_vault: 100n,
      S_dep: 30n,
      S_wdraw: 20n,
    });
    const r = await getStrategyPosition(params);
    expect(r.totalStrategyBalanceInStethShares).toBe(150n);
  });

  it('pending deposit counts toward total but only S_vault is requestable', async () => {
    // S_total = 60 (deposit) + 0 (vault) + 0 (withdrawal)
    // S_cov = max(0, 100 - 60) = 40, not 100
    const { params } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_dep: 60n,
    });
    const r = await getStrategyPosition(params);
    expect(r.totalStrategyBalanceInStethShares).toBe(60n);
    expect(r.totalStethSharesToRepay).toBe(40n);
  });
});

// ─── Phase 3-4: P&L and delegation accounting ────────────────────────────────

describe('P&L and delegation (Phases 3-4)', () => {
  it('profit: available > liability → excess, no shortfall, no coverage needed', async () => {
    // S_total=200, S_ret=0, S_mint=100 → ΔS=100 → excess=100, short=0, S_cov=0
    const { params } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_vault: 200n,
    });
    const r = await getStrategyPosition(params);
    expect(r.totalStethSharesExcess).toBe(100n);
    expect(r.totalStethSharesShortfall).toBe(0n);
    expect(r.totalStethSharesToRepay).toBe(0n);
  });

  it('loss: available < liability → shortfall, excess is zero', async () => {
    // S_total=0, S_ret=0, S_mint=100 → ΔS=-100 → excess=0, short=100
    const { params } = buildFixture({ S_mint_user: 100n, S_pool: 100n });
    const r = await getStrategyPosition(params);
    expect(r.totalStethSharesExcess).toBe(0n);
    expect(r.totalStethSharesShortfall).toBe(100n);
  });

  it('INVARIANT: excess and shortfall cannot both be nonzero', async () => {
    const scenarios: FixtureInput[] = [
      { S_mint_user: 100n, S_pool: 100n, S_vault: 200n },
      { S_mint_user: 100n, S_pool: 100n },
      { S_mint_user: 100n, S_pool: 100n, S_vault: 100n },
    ];
    for (const s of scenarios) {
      const { params } = buildFixture(s);
      const r = await getStrategyPosition(params);
      const bothNonZero =
        r.totalStethSharesExcess > 0n && r.totalStethSharesShortfall > 0n;
      expect(bothNonZero).toBe(false);
    }
  });

  it('vault excess above delegated liability is kept as recoverable profit', async () => {
    // S_deleg = max(0, 100 - 0) = 100, S_avail_ret = min(200, 100) = 100, S_vault_exc = 100
    const { params } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_vault: 200n,
    });
    const r = await getStrategyPosition(params);
    expect(r.strategyStethSharesExcess).toBe(100n);
  });

  it('vault excess is zero when vault exactly covers delegation', async () => {
    // S_deleg = 100, S_avail_ret = min(100, 100) = 100, S_vault_exc = 0
    const { params } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_vault: 100n,
    });
    const r = await getStrategyPosition(params);
    expect(r.strategyStethSharesExcess).toBe(0n);
  });

  it('INVARIANT: strategyStethSharesExcess >= 0', async () => {
    // even when vault < delegated (cannot be negative, capped by min)
    const { params } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_vault: 50n,
    });
    const r = await getStrategyPosition(params);
    expect(r.strategyStethSharesExcess >= 0n).toBe(true);
  });
});

// ─── Phase 6: Proxy repayment (coverage from returned stETH) ─────────────────

describe('proxy repayment (Phase 6)', () => {
  it('no coverage: vault fully covers liability, proxy is untouched', async () => {
    // S_total=200 >= S_mint=100 → S_cov=0
    const { params } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_vault: 200n,
    });
    const r = await getStrategyPosition(params);
    expect(r.totalStethSharesToRepay).toBe(0n);
    expect(r.stethSharesToRepay).toBe(0n);
    expect(r.stethSharesToRebalance).toBe(0n);
  });

  it('full rebalance: vault empty, no returned stETH', async () => {
    // S_total=0, S_ret=0, S_mint=100 → S_cov=100, S_repay=0, S_rebal=100
    const { params } = buildFixture({ S_mint_user: 100n, S_pool: 100n });
    const r = await getStrategyPosition(params);
    expect(r.totalStethSharesToRepay).toBe(100n);
    expect(r.stethSharesToRepay).toBe(0n);
    expect(r.stethSharesToRebalance).toBe(100n);
  });

  it('partial repay + partial rebalance when proxy has some returned stETH', async () => {
    // S_total=30, S_ret=50, S_mint=100
    // S_cov=70, S_repay=min(50,70)=50, S_rebal=70-50=20
    const { params } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_vault: 30n,
      S_ret: 50n,
    });
    const r = await getStrategyPosition(params);
    expect(r.totalStethSharesToRepay).toBe(70n);
    expect(r.stethSharesToRepay).toBe(50n);
    expect(r.stethSharesToRebalance).toBe(20n);
    expect(r.stethSharesToRecover).toBe(0n);
  });

  it('recover: returned stETH exceeds liability to cover', async () => {
    // S_total=100, S_ret=80, S_mint=100 → S_cov=0, S_recov=80
    const { params } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_vault: 100n,
      S_ret: 80n,
    });
    const r = await getStrategyPosition(params);
    expect(r.totalStethSharesToRepay).toBe(0n);
    expect(r.stethSharesToRepay).toBe(0n);
    expect(r.stethSharesToRecover).toBe(80n);
  });

  it('INVARIANT: stethSharesToRecover + stethSharesToRepay == stethSharesOnBalance', async () => {
    const scenarios: FixtureInput[] = [
      { S_mint_user: 100n, S_pool: 100n, S_vault: 30n, S_ret: 50n },
      { S_mint_user: 100n, S_pool: 100n, S_vault: 200n, S_ret: 80n },
      { S_mint_user: 100n, S_pool: 100n, S_vault: 0n, S_ret: 0n },
      { S_mint_user: 100n, S_pool: 100n, S_vault: 0n, S_ret: 100n },
    ];
    for (const s of scenarios) {
      const { params } = buildFixture(s);
      const r = await getStrategyPosition(params);
      expect(r.stethSharesToRecover + r.stethSharesToRepay).toBe(s.S_ret ?? 0n);
    }
  });

  it('INVARIANT: stethSharesToRebalance >= 0', async () => {
    const { params } = buildFixture({ S_mint_user: 100n, S_pool: 100n });
    const r = await getStrategyPosition(params);
    expect(r.stethSharesToRebalance >= 0n).toBe(true);
  });

  it('wstETH unwrap rounding increases rebalance by lost wei', async () => {
    // S_cov=200, S_repay=100 (capped by S_ret=100)
    // convertToShares returns 98n (2 wei lost) → S_rebal = 200 - 98 = 102 (not 100)
    const { params, shares } = buildFixture({
      S_mint_user: 200n,
      S_pool: 200n,
      S_vault: 0n,
      S_ret: 100n,
    });
    shares.convertToShares.mockResolvedValue(98n);

    const r = await getStrategyPosition(params);
    expect(r.stethSharesToRepay).toBe(100n);
    expect(r.stethSharesToRebalance).toBe(102n);
  });

  it('disconnected vault: zero liability means zero coverage and full recovery', async () => {
    // isConnected=false → S_mint=0 → S_cov=0, S_rebal=0, S_recov=S_ret
    const { params } = buildFixture({
      S_mint_user: 200n,
      S_pool: 200n,
      S_ret: 50n,
      isConnected: false,
    });
    const r = await getStrategyPosition(params);
    expect(r.totalMintedStethShares).toBe(0n);
    expect(r.totalStethSharesToRepay).toBe(0n);
    expect(r.stethSharesToRebalance).toBe(0n);
    expect(r.stethSharesToRecover).toBe(50n);
  });

  it('stethSharesLiabilityToCover is passed to unlockedStvOf as second call arg', async () => {
    // S_dep=60, S_mint=100 → S_cov=40; verify that value flows into contract call
    const { params, wrapper } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_dep: 60n,
    });
    await getStrategyPosition(params);
    // unlockedStvOf is called twice: [PROXY, 0n] and [PROXY, S_cov]
    const secondCall = wrapper.prepare.unlockedStvOf.mock.calls[1];
    expect(secondCall[0]).toEqual([PROXY, 40n]);
  });
});

// ─── Phase 9: computePositionHealth integration ───────────────────────────────

describe('computePositionHealth integration (Phase 9)', () => {
  it('healthy position: isUnhealthy=false, isBadDebt=false, shortfall=0', async () => {
    // B=200, U=0, L=100 → locked=min(100,200)=100 → healthy
    const { params } = buildFixture({
      rwr: {
        proxyBalanceStvInEth: 200n,
        proxyUnlockedBalanceStvInEth: 0n,
        totalStethLiabilityInEth: 100n,
      },
    });
    const r = await getStrategyPosition(params);
    expect(r.isUnhealthy).toBe(false);
    expect(r.isBadDebt).toBe(false);
    expect(r.totalLockedEth).toBe(100n);
    expect(r.assetShortfallInEth).toBe(0n);
  });

  it('unhealthy but not bad debt: unlocked > buffer above liability', async () => {
    // B=200, U=120, L=100 → locked=min(100,80)=80 → unhealthy; B>=L → not bad debt
    const { params } = buildFixture({
      rwr: {
        proxyBalanceStvInEth: 200n,
        proxyUnlockedBalanceStvInEth: 120n,
        totalStethLiabilityInEth: 100n,
      },
    });
    const r = await getStrategyPosition(params);
    expect(r.isUnhealthy).toBe(true);
    expect(r.isBadDebt).toBe(false);
    expect(r.totalLockedEth).toBe(80n);
    expect(r.assetShortfallInEth).toBe(20n);
  });

  it('bad debt: proxy balance below liability', async () => {
    // B=80, U=0, L=100 → locked=80 < L → unhealthy; B<L → bad debt
    const { params } = buildFixture({
      rwr: {
        proxyBalanceStvInEth: 80n,
        proxyUnlockedBalanceStvInEth: 0n,
        totalStethLiabilityInEth: 100n,
      },
    });
    const r = await getStrategyPosition(params);
    expect(r.isBadDebt).toBe(true);
    expect(r.isUnhealthy).toBe(true);
    expect(r.assetShortfallInEth).toBe(20n);
  });

  it('INVARIANT: isBadDebt implies isUnhealthy', async () => {
    const { params } = buildFixture({
      rwr: {
        proxyBalanceStvInEth: 50n,
        proxyUnlockedBalanceStvInEth: 0n,
        totalStethLiabilityInEth: 100n,
      },
    });
    const r = await getStrategyPosition(params);
    if (r.isBadDebt) expect(r.isUnhealthy).toBe(true);
  });

  it('INVARIANT: assetShortfallInEth >= 0', async () => {
    const scenarios: RWR[] = [
      {
        proxyBalanceStvInEth: 200n,
        proxyUnlockedBalanceStvInEth: 0n,
        totalStethLiabilityInEth: 100n,
      },
      {
        proxyBalanceStvInEth: 200n,
        proxyUnlockedBalanceStvInEth: 150n,
        totalStethLiabilityInEth: 100n,
      },
      {
        proxyBalanceStvInEth: 50n,
        proxyUnlockedBalanceStvInEth: 0n,
        totalStethLiabilityInEth: 100n,
      },
    ];
    for (const rwr of scenarios) {
      const { params } = buildFixture({ rwr });
      const r = await getStrategyPosition(params);
      expect(r.assetShortfallInEth >= 0n).toBe(true);
    }
  });

  it('connected: totalUserValueInEth uses proxyBalanceStvInEth', async () => {
    const { params } = buildFixture({
      isConnected: true,
      rwr: {
        proxyBalanceStvInEth: 200n,
        proxyNominalBalanceStvInEth: 150n,
        totalStethLiabilityInEth: 100n,
      },
      batch: { totalStethDifference: 20n },
    });
    const r = await getStrategyPosition(params);
    expect(r.totalUserValueInEth).toBe(220n);
  });

  it('disconnected: totalUserValueInEth uses proxyNominalBalanceStvInEth', async () => {
    const { params } = buildFixture({
      isConnected: false,
      rwr: {
        proxyBalanceStvInEth: 200n,
        proxyNominalBalanceStvInEth: 150n,
        totalStethLiabilityInEth: 0n,
      },
      batch: { totalStethDifference: 20n },
    });
    const r = await getStrategyPosition(params);
    expect(r.totalUserValueInEth).toBe(170n);
  });

  it('totalUserValueInEth can be negative under severe stETH loss', async () => {
    const { params } = buildFixture({
      rwr: { proxyBalanceStvInEth: 100n, totalStethLiabilityInEth: 100n },
      batch: { totalStethDifference: -150n },
    });
    const r = await getStrategyPosition(params);
    expect(r.totalUserValueInEth).toBe(-50n);
    expect(r.totalUserValueInEth < 0n).toBe(true);
  });
});

// ─── Post-health computed fields ─────────────────────────────────────────────

describe('post-health derived fields', () => {
  it('totalEthToWithdrawFromProxy is clamped to zero when rebalance exceeds withdrawable', async () => {
    // withdrawableEthAfterRepay=50, stethToRebalance=80 → max(0, 50-80)=0
    const { params } = buildFixture({
      rwr: { withdrawableEthAfterRepay: 50n },
      batch: { stethToRebalance: 80n },
    });
    const r = await getStrategyPosition(params);
    expect(r.totalEthToWithdrawFromProxy).toBe(0n);
  });

  it('totalEthToWithdrawFromProxy is positive when repayable exceeds rebalance', async () => {
    const { params } = buildFixture({
      rwr: { withdrawableEthAfterRepay: 100n },
      batch: { stethToRebalance: 40n },
    });
    const r = await getStrategyPosition(params);
    expect(r.totalEthToWithdrawFromProxy).toBe(60n);
  });

  it('totalValuePendingFromStrategyVaultInEth caps pending unlock at totalLockedEth', async () => {
    // pendingUnlock=200, totalLockedEth=100 (from B=200, U=0, L=100) → min(200,100)=100
    // + stethToRecoverPending=30 → 130
    const { params } = buildFixture({
      rwr: {
        proxyBalanceStvInEth: 200n,
        proxyUnlockedBalanceStvInEth: 0n,
        totalStethLiabilityInEth: 100n,
        pendingUnlockFromStrategyVaultInEth: 200n,
      },
      batch: { stethToRecoverPendingFromStrategyVault: 30n },
    });
    const r = await getStrategyPosition(params);
    expect(r.totalValuePendingFromStrategyVaultInEth).toBe(130n);
  });
});

// ─── Total user value: proxy balance + stETH difference ──────────────────────
//
// totalUserValueInEth = proxyBalanceInEth (Calc/RR-weighted ETH) + totalStethDifference (Lido ≈ 1:1)
//
// All three components of S_total (current vault, pending deposit, pending withdrawal)
// feed into ΔS and thus into totalStethDifference. Only S_vault is requestable.

describe('total user value: proxy balance + stETH difference', () => {
  it('positive stETH difference adds to proxy ETH balance', async () => {
    const { params } = buildFixture({
      rwr: { proxyBalanceStvInEth: 300n },
      batch: { totalStethDifference: 80n },
    });
    const r = await getStrategyPosition(params);
    expect(r.totalUserValueInEth).toBe(380n);
  });

  it('negative stETH difference subtracts from proxy ETH balance (loss rebalanced)', async () => {
    const { params } = buildFixture({
      rwr: { proxyBalanceStvInEth: 200n },
      batch: { totalStethDifference: -60n },
    });
    const r = await getStrategyPosition(params);
    expect(r.totalUserValueInEth).toBe(140n);
  });

  it('pending deposit (S_dep) reduces shortfall vs same position without deposit', async () => {
    // With S_dep=80: S_total=80, S_mint=100 → shortfall = 100-80 = 20
    const { params: withDep } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_dep: 80n,
      S_vault: 0n,
    });
    // Without S_dep: S_total=0 → shortfall = 100
    const { params: noDep } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
    });
    const rWith = await getStrategyPosition(withDep);
    const rNo = await getStrategyPosition(noDep);
    expect(rWith.totalStethSharesShortfall).toBe(20n);
    expect(rNo.totalStethSharesShortfall).toBe(100n);
  });

  it('pending withdrawal (S_wdraw) reduces shortfall vs same position without it', async () => {
    // S_wdraw=60: S_total=60, S_mint=100 → shortfall=40
    const { params: withWdraw } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_wdraw: 60n,
      S_vault: 0n,
    });
    const { params: noWdraw } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
    });
    const rWith = await getStrategyPosition(withWdraw);
    const rNo = await getStrategyPosition(noWdraw);
    expect(rWith.totalStethSharesShortfall).toBe(40n);
    expect(rNo.totalStethSharesShortfall).toBe(100n);
  });

  it('pending deposit reduces S_cov (liability to cover from proxy)', async () => {
    // S_dep=80 → S_total=80 → S_cov = max(0, 100-80) = 20, not 100
    const { params: withDep } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_dep: 80n,
    });
    const { params: noDep } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
    });
    const rWith = await getStrategyPosition(withDep);
    const rNo = await getStrategyPosition(noDep);
    expect(rWith.totalStethSharesToRepay).toBe(20n);
    expect(rNo.totalStethSharesToRepay).toBe(100n);
  });

  it('pending deposit is part of S_total but does NOT increase requestable vault balance', async () => {
    // S_dep=80 counts toward ΔS but S_vault=0 → nothing to request from vault
    const { params } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_dep: 80n,
      S_vault: 0n,
    });
    const r = await getStrategyPosition(params);
    // S_avail_ret = min(S_vault=0, S_deleg) = 0 → totalStethSharesAvailableForReturn = 0
    expect(r.strategyStethSharesBalance).toBe(0n);
    // S_cov = max(0, 100-80) = 20 (deposit reduced it, but S_vault=0 still means proxy must cover all remaining)
    expect(r.totalStethSharesToRepay).toBe(20n);
  });
});

// ─── Withdrawable from Lido Earn: only S_vault, two-rate conversion ───────────
//
// totalEthToWithdrawFromStrategyVault = totalStethSharesAvailableForReturnInEth (Calc)
//                                     + strategyVaultStethExcess (Lido rate)
//
// S_dep and S_wdraw count toward ΔS / total value but are NOT withdrawable from vault.

describe('withdrawable from Lido Earn: S_vault only, two-rate conversion', () => {
  it('pending deposit excluded from withdrawable: totalEthToWithdrawFromStrategyVault=0 when S_vault=0', async () => {
    const { params } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_dep: 80n,
      S_vault: 0n,
      rwr: { totalStethSharesAvailableForReturnInEth: 0n },
      batch: { strategyVaultStethExcess: 0n },
    });
    const r = await getStrategyPosition(params);
    expect(r.totalEthToWithdrawFromStrategyVault).toBe(0n);
  });

  it('pending withdrawal excluded from withdrawable: already in queue, S_vault=0', async () => {
    const { params } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_wdraw: 80n,
      S_vault: 0n,
      rwr: { totalStethSharesAvailableForReturnInEth: 0n },
      batch: { strategyVaultStethExcess: 0n },
    });
    const r = await getStrategyPosition(params);
    expect(r.totalEthToWithdrawFromStrategyVault).toBe(0n);
  });

  it('liability portion (Calc, RR-discounted) and excess portion (Lido rate) sum correctly', async () => {
    // S_vault=200, S_mint=100, S_ret=0
    // S_deleg=100, S_avail_ret=min(200,100)=100, S_vault_exc=100
    // RWR provides 80 for liability portion (Calc: RR discount applied)
    // batch provides 100 for excess (Lido rate: 1:1 to stETH)
    // result = 80 + 100 = 180
    const { params } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_vault: 200n,
      rwr: { totalStethSharesAvailableForReturnInEth: 80n },
      batch: { strategyVaultStethExcess: 100n },
    });
    const r = await getStrategyPosition(params);
    expect(r.totalEthToWithdrawFromStrategyVault).toBe(180n);
    expect(r.strategyVaultStethExcess).toBe(100n); // Lido-rate portion
  });

  it('no excess: withdrawable equals only the Calc-rate liability portion', async () => {
    // S_vault=80, S_mint=100 → S_vault_exc=0; only liability portion via Calc
    const { params } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_vault: 80n,
      rwr: { totalStethSharesAvailableForReturnInEth: 70n },
      batch: { strategyVaultStethExcess: 0n },
    });
    const r = await getStrategyPosition(params);
    expect(r.totalEthToWithdrawFromStrategyVault).toBe(70n);
  });

  it('withdrawable < total user value when inflight deposits exist (S_dep not requestable)', async () => {
    // S_dep=80 contributes to ΔS (total value) but not to withdrawable vault balance
    // S_vault=50 is all that can be requested
    const { params } = buildFixture({
      S_mint_user: 100n,
      S_pool: 100n,
      S_dep: 80n,
      S_vault: 50n,
      rwr: {
        proxyBalanceStvInEth: 300n,
        totalStethSharesAvailableForReturnInEth: 45n, // S_avail_ret=min(50,100)=50 via Calc
      },
      batch: {
        totalStethDifference: 30n,
        strategyVaultStethExcess: 0n, // S_vault_exc = 50-50 = 0
      },
    });
    const r = await getStrategyPosition(params);
    // total user value = 300 + 30 = 330 (includes S_dep contribution via diff)
    expect(r.totalUserValueInEth).toBe(330n);
    // withdrawable from vault = 45 + 0 = 45 (only S_vault portion, not S_dep)
    expect(r.totalEthToWithdrawFromStrategyVault).toBe(45n);
  });
});

// ─── Disconnected vault: liability zeroed via pool cap ────────────────────────
//
// Protocol invariant: a vault can only be disconnected when its global pool
// liability reaches zero. Individual S_mint_user records are NOT cleared —
// they still reflect what the user minted. The position function reconciles
// this by forcing totalPoolLiabilityShares=0 when isConnected=false, capping
// totalMintedStethShares to 0 and zeroing all downstream obligation fields.

describe('disconnected vault: individual liability zeroed via pool cap (I15, I16)', () => {
  it('effective S_mint is 0 even when user personal accounting is non-zero', async () => {
    // S_mint_user=200 stays in user record; pool cap → 0 because isConnected=false
    const { params } = buildFixture({
      S_mint_user: 200n,
      S_pool: 200n,
      isConnected: false,
    });
    const r = await getStrategyPosition(params);
    expect(r.totalMintedStethShares).toBe(0n);
  });

  it('pool liability value is ignored even if nonzero when disconnected (defensive guard)', async () => {
    // S_pool=999 would not happen in prod (protocol guarantees S_pool=0 on disconnect)
    // but the code guard ensures it cannot leak through regardless
    const { params } = buildFixture({
      S_mint_user: 100n,
      S_pool: 999n,
      isConnected: false,
    });
    const r = await getStrategyPosition(params);
    expect(r.totalMintedStethShares).toBe(0n);
    expect(r.totalStethSharesToRepay).toBe(0n);
    expect(r.stethSharesToRebalance).toBe(0n);
  });

  it('all returned stETH on proxy is fully recoverable when disconnected', async () => {
    // S_mint=0 → S_cov=0 → S_repay=0 → stethSharesToRecover = S_ret (all profit, nothing to cover)
    const { params } = buildFixture({
      S_mint_user: 200n,
      S_pool: 200n,
      S_ret: 80n,
      S_vault: 50n,
      isConnected: false,
    });
    const r = await getStrategyPosition(params);
    expect(r.totalStethSharesToRepay).toBe(0n);
    expect(r.stethSharesToRepay).toBe(0n);
    expect(r.stethSharesToRebalance).toBe(0n);
    expect(r.stethSharesToRecover).toBe(80n);
  });

  it('position appears healthy when disconnected (L=0 → no shortfall)', async () => {
    // S_mint=0 flows to calcAssetsToLockForStethShares([0]) → L=0
    // computePositionHealth: L=0 → locked=0, shortfall=0, not unhealthy
    const { params } = buildFixture({
      S_mint_user: 200n,
      S_pool: 200n,
      isConnected: false,
      rwr: {
        proxyBalanceStvInEth: 100n,
        proxyUnlockedBalanceStvInEth: 50n,
        totalStethLiabilityInEth: 0n,
      },
    });
    const r = await getStrategyPosition(params);
    expect(r.isUnhealthy).toBe(false);
    expect(r.isBadDebt).toBe(false);
    expect(r.assetShortfallInEth).toBe(0n);
    expect(r.totalLockedEth).toBe(0n);
  });

  it('S_cov=0 when disconnected flows correctly to unlockedStvOf contract call', async () => {
    const { params, wrapper } = buildFixture({
      S_mint_user: 200n,
      S_pool: 200n,
      S_vault: 50n,
      isConnected: false,
    });
    await getStrategyPosition(params);
    const secondCall = wrapper.prepare.unlockedStvOf.mock.calls[1];
    expect(secondCall[0]).toEqual([PROXY, 0n]);
  });
});

// ─── Phase 11: Minting capacity ──────────────────────────────────────────────

describe('minting capacity (Phase 11)', () => {
  it('availableMintingCapacityStethShares is min of proxy, vault, and Lido global caps', async () => {
    // proxy=100, vault=200, Lido global=1M-0=1M → min=100
    const { params } = buildFixture({
      rwr: {
        currentProxyMintingCapacityShares: 100n,
        currentVaultMintingCapacityShares: 200n,
      },
      lidoCoreMax: 1_000_000n,
      lidoCoreCurrentMinted: 0n,
    });
    const r = await getStrategyPosition(params);
    expect(r.availableMintingCapacityStethShares).toBe(100n);
  });

  it('vault cap is the bottleneck when smaller than proxy and Lido caps', async () => {
    const { params } = buildFixture({
      rwr: {
        currentProxyMintingCapacityShares: 1_000n,
        currentVaultMintingCapacityShares: 50n,
      },
    });
    const r = await getStrategyPosition(params);
    expect(r.availableMintingCapacityStethShares).toBe(50n);
  });

  it('Lido global cap is the bottleneck when minted is near max', async () => {
    const { params } = buildFixture({
      lidoCoreMax: 1000n,
      lidoCoreCurrentMinted: 950n,
      rwr: {
        currentProxyMintingCapacityShares: 1_000_000n,
        currentVaultMintingCapacityShares: 1_000_000n,
      },
    });
    const r = await getStrategyPosition(params);
    expect(r.availableMintingCapacityStethShares).toBe(50n);
  });

  // RISK-1 fix: clampZeroBN(max - current) prevents negative capacity when oracle lags
  it('[RISK-1] Lido global term clamped to zero when minted exceeds max', async () => {
    const { params } = buildFixture({
      lidoCoreMax: 100n,
      lidoCoreCurrentMinted: 150n, // over-minted (oracle lag edge case)
      rwr: {
        currentProxyMintingCapacityShares: 1_000_000n,
        currentVaultMintingCapacityShares: 1_000_000n,
      },
    });
    const r = await getStrategyPosition(params);
    expect(r.availableMintingCapacityStethShares).toBe(0n);
  });

  it('targetUtilizationBP = 10000 - reserveRatioBP', async () => {
    const { params } = buildFixture({ reserveRatioBP: 1000n });
    const r = await getStrategyPosition(params);
    expect(r.targetUtilizationBP).toBe(9000n);
  });

  it('currentUtilizationBP is zero when proxy ETH balance is zero', async () => {
    const { params } = buildFixture({ rwr: { proxyBalanceStvInEth: 0n } });
    const r = await getStrategyPosition(params);
    expect(r.currentUtilizationBP).toBe(0n);
  });

  it('currentUtilizationBP = (totalMintedSteth * 10000) / proxyBalance', async () => {
    // 90 minted / 100 balance = 90% = 9000 BP
    const { params } = buildFixture({
      rwr: { proxyBalanceStvInEth: 100n },
      batch: { totalMintedSteth: 90n },
    });
    const r = await getStrategyPosition(params);
    expect(r.currentUtilizationBP).toBe(9000n);
  });
});
