import { zeroAddress } from 'viem';

import { getChainConfig } from '@tests/config';

import { getRoleAddress } from './accounts';
import type { DefiWrapperTypes } from '../../src/modules/defi-wrapper';
import type { EthereumNodeService } from '@lidofinance/wallets-testing-nodes';

export const vaultConfig = (nodeService: EthereumNodeService) => ({
  nodeOperator: getRoleAddress(nodeService, 'nodeOperator'),
  nodeOperatorManager: getRoleAddress(nodeService, 'nodeOperatorManager'),
  // Must stay 0: a single injected no-op report can't roll the LazyOracle
  // refSlot inOutDelta cache, so any nonzero fee charges phantom growth on
  // post-creation deposits and breaks full-balance finalize().
  nodeOperatorFeeBP: 0n,
  confirmExpiry: 3600n,
});

export const timelockConfig = (nodeService: EthereumNodeService) => ({
  minDelaySeconds: 60n,
  proposer: getRoleAddress(nodeService, 'timelockProposer'),
  executor: getRoleAddress(nodeService, 'timelockExecutor'),
});

export const MIN_WITHDRAWAL_DELAY_TIME = 3600n;

// Clears MIN_WITHDRAWAL_DELAY_TIME with a margin, so finalize() stops gating on
// the delay.
export const WITHDRAWAL_DELAY_ADVANCE_SECONDS =
  Number(MIN_WITHDRAWAL_DELAY_TIME) + 100;

export const commonPoolConfig = (
  nodeService: EthereumNodeService,
  namePrefix: string,
) => ({
  minWithdrawalDelayTime: MIN_WITHDRAWAL_DELAY_TIME,
  name: `${namePrefix} E2E Pool`,
  symbol: 'E2E',
  emergencyCommittee: getRoleAddress(nodeService, 'emergencyCommittee'),
});

// Per pool-type params for createPoolStvStart / createPoolFinish. StvPool keeps
// allowListEnabled=false, so the happy path needs no allow-list grants.
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
