import { zeroAddress } from 'viem';

import { getRoleAddress } from './accounts';
import { getChainConfig } from '../config/chainConfig';
import type { DefiWrapperTypes } from '../../src/modules/defi-wrapper';
import type { EthereumNodeService } from '@lidofinance/wallets-testing-nodes';

export const vaultConfig = (nodeService: EthereumNodeService) => ({
  nodeOperator: getRoleAddress(nodeService, 'nodeOperator'),
  nodeOperatorManager: getRoleAddress(nodeService, 'nodeOperatorManager'),
  // 0 for the E2E suite: a single manually-injected no-op report can't
  // correctly roll the LazyOracle refSlot inOutDelta cache, so any nonzero
  // fee rate charges phantom "growth" equal to deposits made after pool
  // creation (confirmed live: nodeOperatorFeeBP=10 ate exactly 0.1% of a
  // post-creation 1 ETH deposit out of withdrawableValue, failing
  // finalize() for a full-balance withdrawal). Fee economics are out of
  // scope for the happy-path milestone; revisit alongside the milestone-2
  // reward/lazyOracle work if fee behavior needs coverage.
  nodeOperatorFeeBP: 0n,
  confirmExpiry: 3600n,
});

export const timelockConfig = (nodeService: EthereumNodeService) => ({
  minDelaySeconds: 60n,
  proposer: getRoleAddress(nodeService, 'timelockProposer'),
  executor: getRoleAddress(nodeService, 'timelockExecutor'),
});

export const commonPoolConfig = (
  nodeService: EthereumNodeService,
  namePrefix: string,
) => ({
  minWithdrawalDelayTime: 3600n,
  name: `${namePrefix} E2E Pool`,
  symbol: 'E2E',
  emergencyCommittee: getRoleAddress(nodeService, 'emergencyCommittee'),
});

// Per pool-type params for createPoolStvStart / createPoolFinish.
// StvPool is deliberately allowListEnabled=false (open to all) per QA decision —
// no allow-list grants are needed for the happy-path suite.
export const POOL_PARAMS: Record<
  DefiWrapperTypes,
  {
    allowListEnabled: boolean;
    allowListManager: `0x${string}`;
    mintingEnabled: boolean;
    reserveRatioGapBP: bigint;
    strategyFactory: `0x${string}`;
  }
> = {
  StvPool: {
    allowListEnabled: false,
    allowListManager: zeroAddress,
    mintingEnabled: false,
    reserveRatioGapBP: 0n,
    strategyFactory: zeroAddress,
  },
  StvStETHPool: {
    allowListEnabled: false,
    allowListManager: zeroAddress,
    mintingEnabled: true,
    reserveRatioGapBP: 250n,
    strategyFactory: zeroAddress,
  },
  StvStrategyPool: {
    allowListEnabled: true,
    allowListManager: zeroAddress,
    mintingEnabled: true,
    reserveRatioGapBP: 250n,
    // Mellow (strategy.mellow.v1) — the only strategy provider deployed on
    // Hoodi (GGV is deprecated); real per-chain address, see chainConfig.ts.
    strategyFactory: getChainConfig().mellow.strategyFactory,
  },
};
