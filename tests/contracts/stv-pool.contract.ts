import { getContract } from 'viem';
import type { Address } from 'viem';

import { getPublicClient } from '../providers';
import { STV_POOL_ABI } from './abi/stv-pool-abi';

export class StvPoolContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: STV_POOL_ABI,
      client: getPublicClient(),
    });
  }

  assetsOf(account: Address) {
    return this.getContract().read.assetsOf([account]);
  }
}
