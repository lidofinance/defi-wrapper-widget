import { getContract } from 'viem';
import type { Address } from 'viem';
import { LidoAbi } from '@lidofinance/lido-ethereum-sdk/core';

import { getPublicClient } from '../providers';

export class StethContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: LidoAbi,
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
