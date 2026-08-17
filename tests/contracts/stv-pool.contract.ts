import { getContract } from 'viem';
import type { Address } from 'viem';

import { getPublicClient } from '@tests/providers';
import { StvPoolAbi } from '../../src/abi/stv-pool-abi';

export class StvPoolContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: StvPoolAbi,
      client: getPublicClient(),
    });
  }

  assetsOf(account: Address) {
    return this.getContract().read.assetsOf([account]);
  }
}
