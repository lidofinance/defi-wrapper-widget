import { type Address, getContract, GetContractReturnType } from 'viem';

import { StvPoolAbi, StvPoolAbiType } from '@/abi/stv-pool-abi';
import type { RegisteredPublicClient } from '@/modules/web3';
import { EncodableContract, getEncodable } from '@/utils/encodable';

export type StvPoolContract = EncodableContract<
  GetContractReturnType<StvPoolAbiType, RegisteredPublicClient>
>;

export const getStvPoolContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): StvPoolContract => {
  return getEncodable(
    getContract({
      address,
      abi: StvPoolAbi,
      client: publicClient,
    }),
  );
};
