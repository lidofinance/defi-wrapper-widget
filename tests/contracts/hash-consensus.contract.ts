import { getContract } from 'viem';
import type { Address } from 'viem';

import { getPublicClient } from '@tests/providers';
import { HASH_CONSENSUS_ABI } from './abi/core-abi';

export class HashConsensusContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: HASH_CONSENSUS_ABI,
      client: getPublicClient(),
    });
  }

  getCurrentFrame() {
    return this.getContract().read.getCurrentFrame();
  }
}
