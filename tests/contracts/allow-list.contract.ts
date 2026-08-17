import { getContract } from 'viem';
import type { Account, Address } from 'viem';

import { getViemChain } from '@tests/config';
import { getPublicClient, getSharedWalletClient } from '@tests/providers';
import { StvPoolAbi } from '../../src/abi/stv-pool-abi';

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
