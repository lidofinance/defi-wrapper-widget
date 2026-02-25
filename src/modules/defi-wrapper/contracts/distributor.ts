import { type Address, getContract, GetContractReturnType } from 'viem';

import { DistributorAbi, DistributorAbiType } from '@/abi/distributor-abi';
import type { RegisteredPublicClient } from '@/modules/web3';
import { EncodableContract, getEncodable } from '@/utils/encodable';

export type DistributorContract = EncodableContract<
  GetContractReturnType<DistributorAbiType, RegisteredPublicClient>
>;

export const getDistributorContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): DistributorContract => {
  return getEncodable(
    getContract({
      address,
      abi: DistributorAbi,
      client: publicClient,
    }),
  );
};
