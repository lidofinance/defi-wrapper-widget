import { getContract } from 'viem';
import type { Address } from 'viem';

import { getPublicClient } from '../providers';
import { STETH_ABI } from './abi/steth-abi';

export class StethContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: STETH_ABI,
      client: getPublicClient(),
    });
  }

  balanceOf(account: Address) {
    return this.getContract().read.balanceOf([account]);
  }

  sharesOf(account: Address) {
    return this.getContract().read.sharesOf([account]);
  }
}
