import { type Address, getContract, GetContractReturnType } from 'viem';

import { StvPoolAbi, StvPoolAbiType } from '@/abi/stv-pool-abi';
import type { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

export const getStvPoolContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): GetContractReturnType<StvPoolAbiType, RegisteredPublicClient> => {
  return getEncodable(
    getContract({
      address,
      abi: StvPoolAbi,
      client: publicClient,
    }),
  );
};
