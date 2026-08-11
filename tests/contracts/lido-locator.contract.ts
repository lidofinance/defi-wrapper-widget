import { getContract } from 'viem';
import type { Address } from 'viem';

import { getPublicClient } from '../providers';
import { LIDO_LOCATOR_ABI } from './abi/core-abi';

export class LidoLocatorContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: LIDO_LOCATOR_ABI,
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
