import { getContract } from 'viem';
import type { Address } from 'viem';
import { LidoLocatorAbi } from '@lidofinance/lido-ethereum-sdk/core';

import { getPublicClient } from '../providers';

export class LidoLocatorContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: LidoLocatorAbi,
      client: getPublicClient(),
    });
  }

  accountingOracle() {
    return this.getContract().read.accountingOracle();
  }

  vaultHub() {
    return this.getContract().read.vaultHub();
  }

  lazyOracle() {
    return this.getContract().read.lazyOracle();
  }

  lido() {
    return this.getContract().read.lido();
  }
}
