import { getContract } from 'viem';
import type { Account, Address } from 'viem';

import { StvPoolAbi } from '../../src/abi/stv-pool-abi';
import { getViemChain } from '../config/chainConfig';
import { getPublicClient, getSharedWalletClient } from '../providers';

export class AllowListContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: StvPoolAbi,
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
