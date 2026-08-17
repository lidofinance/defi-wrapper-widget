import { getContract } from 'viem';
import type { Account, Address } from 'viem';

import { WithdrawalQueueAbi } from '../../src/abi/withdrawal-queue-abi';
import { getViemChain } from '../config/chainConfig';
import { getPublicClient, getSharedWalletClient } from '../providers';

export class WithdrawalQueueContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: WithdrawalQueueAbi,
      client: { public: getPublicClient(), wallet: getSharedWalletClient() },
    });
  }

  withdrawalRequestsOf(owner: Address) {
    return this.getContract().read.withdrawalRequestsOf([owner]);
  }

  getWithdrawalStatusBatch(requestIds: readonly bigint[]) {
    return this.getContract().read.getWithdrawalStatusBatch([requestIds]);
  }

  getClaimableEther(requestId: bigint) {
    return this.getContract().read.getClaimableEther([requestId]);
  }

  async finalize(
    maxRequests: bigint,
    gasCostCoverageRecipient: Address,
    account: Account | Address,
  ) {
    const hash = await this.getContract().write.finalize(
      [maxRequests, gasCostCoverageRecipient],
      { account, chain: getViemChain() },
    );
    return getPublicClient().waitForTransactionReceipt({ hash });
  }
}
