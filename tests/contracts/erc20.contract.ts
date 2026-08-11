import { getContract } from 'viem';
import type { Account, Address } from 'viem';

import { getViemChain } from '../config/chainConfig';
import { getPublicClient, getSharedWalletClient } from '../providers';
import { ERC20_ABI } from './abi/mellow-abi';

export class Erc20Contract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: ERC20_ABI,
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
