import { getContract } from 'viem';
import type { Address } from 'viem';

import { getPublicClient } from '../providers';
import { STV_STETH_ABI } from './abi/stv-steth-abi';

export class StvStethContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: STV_STETH_ABI,
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
