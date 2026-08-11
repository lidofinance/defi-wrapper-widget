import { getContract } from 'viem';
import type { Account, Address } from 'viem';

import { getViemChain } from '../config/chainConfig';
import { getPublicClient, getSharedWalletClient } from '../providers';
import { MELLOW_REDEEM_QUEUE_ABI } from './abi/mellow-abi';

export class AsyncRedeemQueueContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: MELLOW_REDEEM_QUEUE_ABI,
      client: { public: getPublicClient(), wallet: getSharedWalletClient() },
    });
  }

  async handleBatches(batches: bigint, account: Account | Address) {
    const hash = await this.getContract().write.handleBatches([batches], {
      account,
      chain: getViemChain(),
    });
    return getPublicClient().waitForTransactionReceipt({ hash });
  }
}
