import { getContract } from 'viem';
import type { Account, Address } from 'viem';

import { getViemChain } from '../config/chainConfig';
import { getPublicClient, getSharedWalletClient } from '../providers';
import { ALLOW_LIST_ABI } from './abi/harness-abi';

export class AllowListContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: ALLOW_LIST_ABI,
      client: { public: getPublicClient(), wallet: getSharedWalletClient() },
    });
  }

  async add(accountToAdd: Address, account: Account | Address) {
    const hash = await this.getContract().write.addToAllowList([accountToAdd], {
      account,
      chain: getViemChain(),
    });
    return getPublicClient().waitForTransactionReceipt({ hash });
  }
}
