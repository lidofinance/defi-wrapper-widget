import { getContract } from 'viem';
import type { Account, Address, Hex } from 'viem';

import { getViemChain } from '@tests/config';
import { getPublicClient, getSharedWalletClient } from '@tests/providers';
import { MELLOW_VAULT_ABI } from './abi/mellow-abi';

export class MellowVaultContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: MELLOW_VAULT_ABI,
      client: { public: getPublicClient(), wallet: getSharedWalletClient() },
    });
  }

  getRoleMember(role: Hex, index = 0) {
    return this.getContract().read.getRoleMember([role, BigInt(index)]);
  }

  getRoleMemberCount(role: Hex) {
    return this.getContract().read.getRoleMemberCount([role]);
  }

  async grantRole(role: Hex, grantee: Address, account: Account | Address) {
    const hash = await this.getContract().write.grantRole([role, grantee], {
      account,
      chain: getViemChain(),
    });
    return getPublicClient().waitForTransactionReceipt({ hash });
  }
}
