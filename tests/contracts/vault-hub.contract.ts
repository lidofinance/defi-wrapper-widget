import { getContract } from 'viem';
import type { Address } from 'viem';

import { getPublicClient } from '../providers';
import { VAULT_HUB_ABI } from './abi/core-abi';

export class VaultHubContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: VAULT_HUB_ABI,
      client: getPublicClient(),
    });
  }

  vaultRecord(vault: Address) {
    return this.getContract().read.vaultRecord([vault]);
  }
}
