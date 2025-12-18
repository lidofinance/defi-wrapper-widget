import { type Address, getContract } from 'viem';

import { StakingVaultAbi } from '@/abi/staking-vault';
import { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

// TODO: move to lido-sdk
export const getStakingVaultContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
) => {
  return getEncodable(
    getContract({
      address,
      abi: StakingVaultAbi,
      client: {
        public: publicClient,
      },
    }),
  );
};
