import { getContract, parseEventLogs } from 'viem';
import type { Account, Address } from 'viem';

import { getViemChain } from '@tests/config';
import { getPublicClient, getSharedWalletClient } from '@tests/providers';
import { FACTORY_ABI, STV_POOL_DISTRIBUTOR_ABI } from './abi/factory-abi';

export type VaultConfig = {
  nodeOperator: Address;
  nodeOperatorManager: Address;
  nodeOperatorFeeBP: bigint;
  confirmExpiry: bigint;
};

export type TimelockConfig = {
  minDelaySeconds: bigint;
  proposer: Address;
  executor: Address;
};

export type CommonPoolConfig = {
  minWithdrawalDelayTime: bigint;
  name: string;
  symbol: string;
  emergencyCommittee: Address;
};

export type AuxiliaryPoolConfig = {
  allowListEnabled: boolean;
  allowListManager: Address;
  mintingEnabled: boolean;
  reserveRatioGapBP: bigint;
};

export type PoolIntermediate = {
  dashboard: Address;
  poolProxy: Address;
  poolImpl: Address;
  withdrawalQueueProxy: Address;
  wqImpl: Address;
  timelock: Address;
};

export type PoolDeployment = {
  poolType: `0x${string}`;
  vault: Address;
  dashboard: Address;
  pool: Address;
  withdrawalQueue: Address;
  distributor: Address;
  timelock: Address;
  strategy: Address;
};

export class FactoryContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: FACTORY_ABI,
      client: { public: getPublicClient(), wallet: getSharedWalletClient() },
    });
  }

  async createPoolStvStart(
    vaultConfig: VaultConfig,
    timelockConfig: TimelockConfig,
    commonPoolConfig: CommonPoolConfig,
    allowListEnabled: boolean,
    allowListManager: Address,
    account: Account | Address,
  ) {
    const hash = await this.getContract().write.createPoolStvStart(
      [
        vaultConfig,
        timelockConfig,
        commonPoolConfig,
        allowListEnabled,
        allowListManager,
      ],
      { account, chain: getViemChain() },
    );
    return this.readIntermediate(hash);
  }

  async createPoolStvStethStart(
    vaultConfig: VaultConfig,
    timelockConfig: TimelockConfig,
    commonPoolConfig: CommonPoolConfig,
    allowListEnabled: boolean,
    allowListManager: Address,
    reserveRatioGapBp: bigint,
    account: Account | Address,
  ) {
    const hash = await this.getContract().write.createPoolStvStETHStart(
      [
        vaultConfig,
        timelockConfig,
        commonPoolConfig,
        allowListEnabled,
        allowListManager,
        reserveRatioGapBp,
      ],
      { account, chain: getViemChain() },
    );
    return this.readIntermediate(hash);
  }

  async createPoolStart(
    vaultConfig: VaultConfig,
    timelockConfig: TimelockConfig,
    commonPoolConfig: CommonPoolConfig,
    auxiliaryConfig: AuxiliaryPoolConfig,
    strategyFactory: Address,
    strategyDeployBytes: `0x${string}`,
    account: Account | Address,
  ) {
    const hash = await this.getContract().write.createPoolStart(
      [
        vaultConfig,
        timelockConfig,
        commonPoolConfig,
        auxiliaryConfig,
        strategyFactory,
        strategyDeployBytes,
      ],
      { account, chain: getViemChain() },
    );
    return this.readIntermediate(hash);
  }

  async createPoolFinish(
    vaultConfig: VaultConfig,
    timelockConfig: TimelockConfig,
    commonPoolConfig: CommonPoolConfig,
    auxiliaryConfig: AuxiliaryPoolConfig,
    strategyFactory: Address,
    strategyDeployBytes: `0x${string}`,
    intermediate: PoolIntermediate,
    value: bigint,
    account: Account | Address,
  ): Promise<PoolDeployment> {
    const hash = await this.getContract().write.createPoolFinish(
      [
        vaultConfig,
        timelockConfig,
        commonPoolConfig,
        auxiliaryConfig,
        strategyFactory,
        strategyDeployBytes,
        intermediate,
      ],
      { account, chain: getViemChain(), value },
    );
    const receipt = await getPublicClient().waitForTransactionReceipt({ hash });
    const [created] = parseEventLogs({
      abi: FACTORY_ABI,
      eventName: 'PoolCreated',
      logs: receipt.logs,
    });
    if (!created) {
      throw new Error(`PoolCreated event not found in transaction ${hash}`);
    }

    const distributor = await getContract({
      address: created.args.pool,
      abi: STV_POOL_DISTRIBUTOR_ABI,
      client: getPublicClient(),
    }).read.DISTRIBUTOR();

    return {
      poolType: created.args.poolType,
      vault: created.args.vault,
      dashboard: intermediate.dashboard,
      pool: created.args.pool,
      withdrawalQueue: created.args.withdrawalQueue,
      distributor,
      timelock: intermediate.timelock,
      strategy: created.args.strategy,
    };
  }

  private async readIntermediate(hash: `0x${string}`) {
    const receipt = await getPublicClient().waitForTransactionReceipt({ hash });
    const [started] = parseEventLogs({
      abi: FACTORY_ABI,
      eventName: 'PoolCreationStarted',
      logs: receipt.logs,
    });
    if (!started) {
      throw new Error(
        `PoolCreationStarted event not found in transaction ${hash}`,
      );
    }
    return started.args.intermediate;
  }
}
