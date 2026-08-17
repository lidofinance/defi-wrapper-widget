import { getContract } from 'viem';
import type { Address } from 'viem';

import { StvStethAbi } from '../../src/abi/stv-steth-abi';
import { getPublicClient } from '../providers';

export class StvStethContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: StvStethAbi,
      client: getPublicClient(),
    });
  }

  assetsOf(account: Address) {
    return this.getContract().read.assetsOf([account]);
  }

  mintedStethSharesOf(account: Address) {
    return this.getContract().read.mintedStethSharesOf([account]);
  }
}
