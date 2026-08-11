import { getContract } from 'viem';
import type { Address } from 'viem';

import { getPublicClient } from '../providers';
import { BASE_ORACLE_ABI } from './abi/core-abi';

export class BaseOracleContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: BASE_ORACLE_ABI,
      client: getPublicClient(),
    });
  }

  getConsensusContract() {
    return this.getContract().read.getConsensusContract();
  }
}
