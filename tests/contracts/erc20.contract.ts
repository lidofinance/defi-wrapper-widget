import { erc20Abi, getContract } from 'viem';
import type { Account, Address } from 'viem';

import { getViemChain } from '@tests/config';
import { getPublicClient, getSharedWalletClient } from '@tests/providers';

export class Erc20Contract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: erc20Abi,
      client: { public: getPublicClient(), wallet: getSharedWalletClient() },
    });
  }

  balanceOf(account: Address) {
    return this.getContract().read.balanceOf([account]);
  }

  async transfer(to: Address, amount: bigint, account: Account | Address) {
    const hash = await this.getContract().write.transfer([to, amount], {
      account,
      chain: getViemChain(),
    });
    return getPublicClient().waitForTransactionReceipt({ hash });
  }
}
