import { encodeAbiParameters, keccak256, type Address } from 'viem';

import { getChainConfig } from '../../config/chainConfig';
import { BaseOracleContract } from '../../contracts/base-oracle.contract';
import { DashboardContract } from '../../contracts/dashboard.contract';
import { HashConsensusContract } from '../../contracts/hash-consensus.contract';
import { LazyOracleContract } from '../../contracts/lazy-oracle.contract';
import { LidoLocatorContract } from '../../contracts/lido-locator.contract';
import { VaultHubContract } from '../../contracts/vault-hub.contract';
import { getPublicClient, getTestClient } from '../../providers';
import { ensureFunded } from './impersonation';

// Single-leaf OZ StandardMerkleTree leaf, matching CoreHarness.applyVaultReport
// (test/utils/CoreHarness.sol): keccak256(bytes.concat(keccak256(abi.encode(...)))).
const buildLeaf = (
  vault: Address,
  totalValue: bigint,
  cumulativeLidoFees: bigint,
  liabilityShares: bigint,
  maxLiabilityShares: bigint,
  slashingReserve: bigint,
) => {
  const inner = keccak256(
    encodeAbiParameters(
      [
        { type: 'address' },
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'uint256' },
      ],
      [
        vault,
        totalValue,
        cumulativeLidoFees,
        liabilityShares,
        maxLiabilityShares,
        slashingReserve,
      ],
    ),
  );
  return keccak256(inner);
};

/**
 * Refreshes (or bumps, via `totalValueFactorBp`) the oracle report for
 * `vault` on the fork, impersonating LidoLocator's accountingOracle to
 * inject a single-leaf Merkle report — the same trick as
 * CoreHarness.applyVaultReport / lido-autotests'
 * utils/nodeHelpers/lazyOracleMock.ts, ported to viem.
 *
 * A fresh report is required for every StvPool/WithdrawalQueue state change
 * (deposit/requestWithdrawal/finalize all gate on `isReportFresh`), and
 * `finalize()` additionally requires the request's timestamp to be <= the
 * latest report timestamp — so requests made after the last report need a
 * NEW report (advancing time alone does not create one). `totalValueFactorBp`
 * > 10000 simulates rewards (e.g. 10500 = +5%), < 10000 simulates a loss.
 */
export const applyVaultReport = async (
  vault: Address,
  dashboard: Address,
  opts: { totalValueFactorBp?: bigint } = {},
) => {
  const publicClient = getPublicClient();
  const testClient = getTestClient();
  const lidoLocatorAddress = getChainConfig().lidoLocatorAddress;
  const lidoLocatorContract = new LidoLocatorContract(lidoLocatorAddress);

  const [accountingOracle, vaultHubAddress, lazyOracleAddress] =
    await Promise.all([
      lidoLocatorContract.accountingOracle(),
      lidoLocatorContract.vaultHub(),
      lidoLocatorContract.lazyOracle(),
    ]);

  const [hashConsensus, record, dashboardTotalValue] = await Promise.all([
    new BaseOracleContract(accountingOracle).getConsensusContract(),
    new VaultHubContract(vaultHubAddress).vaultRecord(vault),
    // record.report.totalValue is frozen as of the LAST report and doesn't
    // reflect deposits/withdrawals made since (those only move inOutDelta,
    // not totalValue) — confirmed live via trace: scaling the stale report
    // value, and separately the vault's raw ETH balance, both undercounted
    // a deposit made after pool creation, producing a negative "boost".
    // Dashboard.totalValue() is what StvPoolHarness.reportVaultValueChangeNoFees
    // (test/utils/StvPoolHarness.sol) scales, and is asserted to round-trip
    // exactly after the report — the correct live baseline.
    new DashboardContract(dashboard).totalValue(),
  ]);

  const [refSlot] = await new HashConsensusContract(
    hashConsensus,
  ).getCurrentFrame();

  const factorBp = opts.totalValueFactorBp ?? 10_000n;
  const totalValue = (dashboardTotalValue * factorBp) / 10_000n;
  const liabilityShares = record.liabilityShares;
  const maxLiabilityShares =
    liabilityShares > record.maxLiabilityShares
      ? liabilityShares
      : record.maxLiabilityShares;
  const cumulativeLidoFees = 0n;
  const slashingReserve = 0n;

  const leaf = buildLeaf(
    vault,
    totalValue,
    cumulativeLidoFees,
    liabilityShares,
    maxLiabilityShares,
    slashingReserve,
  );

  // Use the fork's own block.timestamp, not wall-clock time — VaultHub's
  // _isReportFresh() computes `block.timestamp - latestReportTimestamp`
  // with a plain (unchecked-by-guard) subtraction. Anvil's block.timestamp
  // can lag behind real time (blocks aren't mined every wall-clock second),
  // so a wall-clock reportTimestamp can end up AHEAD of block.timestamp and
  // underflow that subtraction — confirmed live via a forced/traced
  // finalize() call reverting with panic 0x11 inside isReportFresh().
  const latestBlock = await publicClient.getBlock();
  const reportTimestamp = latestBlock.timestamp;

  await ensureFunded(accountingOracle);
  await testClient.impersonateAccount({ address: accountingOracle });
  const lazyOracleContract = new LazyOracleContract(lazyOracleAddress);

  await lazyOracleContract.updateReportData(
    reportTimestamp,
    refSlot,
    leaf,
    '',
    accountingOracle,
  );

  // updateVaultData is permissionless (proof is empty for our single-leaf
  // tree) — submitted from the same still-impersonated account for
  // simplicity, since impersonation doesn't require a real private key.
  await lazyOracleContract.updateVaultData(
    vault,
    totalValue,
    cumulativeLidoFees,
    liabilityShares,
    maxLiabilityShares,
    slashingReserve,
    [],
    accountingOracle,
  );
  await testClient.stopImpersonatingAccount({ address: accountingOracle });
};
