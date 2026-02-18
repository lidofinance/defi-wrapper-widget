import { type Address, getContract, GetContractReturnType } from 'viem';

import { StvStethAbi, StvStethAbiType } from '@/abi/stv-steth-abi';
import type { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

export const getStvStethContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): GetContractReturnType<StvStethAbiType, RegisteredPublicClient> => {
  return getEncodable(
    getContract({
      address,
      abi: StvStethAbi,
      client: publicClient,
    }),
  );
};
