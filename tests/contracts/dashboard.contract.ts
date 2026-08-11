import { getContract } from 'viem';
import type { Address } from 'viem';

import { getPublicClient } from '../providers';
import { DASHBOARD_ABI } from './abi/core-abi';

export class DashboardContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: DASHBOARD_ABI,
      client: getPublicClient(),
    });
  }

  totalValue() {
    return this.getContract().read.totalValue();
  }
}
