import { getContract, maxUint256 } from 'viem';
import type { Address } from 'viem';

import { getPublicClient } from '../providers';
import { MELLOW_STRATEGY_READ_ABI } from './abi/mellow-abi';

export class MellowStrategyContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: MELLOW_STRATEGY_READ_ABI,
      client: getPublicClient(),
    });
  }

  async getDepositRequestOf(account: Address) {
    const [assets, timestamp, isClaimable] =
      await this.getContract().read.getDepositRequestOf([account]);
    return { assets, timestamp, isClaimable };
  }

  sharesOf(account: Address) {
    return this.getContract().read.sharesOf([account]);
  }

  claimableSharesOf(account: Address) {
    return this.getContract().read.claimableSharesOf([account]);
  }

  activeSharesOf(account: Address) {
    return this.getContract().read.activeSharesOf([account]);
  }

  stvOf(account: Address) {
    return this.getContract().read.stvOf([account]);
  }

  wstethOf(account: Address) {
    return this.getContract().read.wstethOf([account]);
  }

  mintedStethSharesOf(account: Address) {
    return this.getContract().read.mintedStethSharesOf([account]);
  }

  getRedeemQueueRequests(account: Address, offset = 0n, limit = maxUint256) {
    return this.getContract().read.getRedeemQueueRequests([
      account,
      offset,
      limit,
    ]);
  }
}
