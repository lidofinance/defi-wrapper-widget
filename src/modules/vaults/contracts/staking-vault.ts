import { type Address, getContract, type GetContractReturnType } from 'viem';

import { StakingVaultAbi, type StakingVaultAbiType } from '@/abi/staking-vault';
import { RegisteredPublicClient } from '@/modules/web3';
import { EncodableContract, getEncodable } from '@/utils/encodable';

// TODO: move to lido-sdk
export const getStakingVaultContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): EncodableContract<
  GetContractReturnType<StakingVaultAbiType, RegisteredPublicClient>
> => {
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
