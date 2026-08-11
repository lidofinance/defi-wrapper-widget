import { getContract } from 'viem';
import type { Account, Address } from 'viem';

import { getViemChain } from '../config/chainConfig';
import { getPublicClient, getSharedWalletClient } from '../providers';
import { WSTETH_REFERRAL_STAKER_ABI } from './abi/mellow-abi';

export class WstethReferralStakerContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: WSTETH_REFERRAL_STAKER_ABI,
      client: { public: getPublicClient(), wallet: getSharedWalletClient() },
    });
  }

  async stakeEth(referral: Address, value: bigint, account: Account | Address) {
    const hash = await this.getContract().write.stakeETH([referral], {
      account,
      chain: getViemChain(),
      value,
    });
    return getPublicClient().waitForTransactionReceipt({ hash });
  }
}
