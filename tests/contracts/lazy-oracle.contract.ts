import { getContract } from 'viem';
import type { Account, Address, Hash, Hex } from 'viem';

import { getViemChain } from '../config/chainConfig';
import { getPublicClient, getSharedWalletClient } from '../providers';
import { LAZY_ORACLE_ABI } from './abi/core-abi';

export class LazyOracleContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: LAZY_ORACLE_ABI,
      client: { public: getPublicClient(), wallet: getSharedWalletClient() },
    });
  }

  async updateReportData(
    timestamp: bigint,
    refSlot: bigint,
    treeRoot: Hex,
    reportCid: string,
    account: Account | Address,
  ) {
    const hash = await this.getContract().write.updateReportData(
      [timestamp, refSlot, treeRoot, reportCid],
      { account, chain: getViemChain() },
    );
    return this.waitForReceipt(hash);
  }

  async updateVaultData(
    vault: Address,
    totalValue: bigint,
    cumulativeLidoFees: bigint,
    liabilityShares: bigint,
    maxLiabilityShares: bigint,
    slashingReserve: bigint,
    proof: readonly Hex[],
    account: Account | Address,
  ) {
    const hash = await this.getContract().write.updateVaultData(
      [
        vault,
        totalValue,
        cumulativeLidoFees,
        liabilityShares,
        maxLiabilityShares,
        slashingReserve,
        proof,
      ],
      { account, chain: getViemChain() },
    );
    return this.waitForReceipt(hash);
  }

  private waitForReceipt(hash: Hash) {
    return getPublicClient().waitForTransactionReceipt({ hash });
  }
}
