import { type Address, getContract, GetContractReturnType } from 'viem';

import {
  GenericStrategyAbi,
  GenericStrategyAbiType,
} from '@/abi/generic-strategy-abi';
import type { RegisteredPublicClient } from '@/modules/web3';
import { EncodableContract, getEncodable } from '@/utils/encodable';

export type StrategyContract = EncodableContract<
  GetContractReturnType<GenericStrategyAbiType, RegisteredPublicClient>
>;

export const getStrategyContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): StrategyContract => {
  return getEncodable(
    getContract({
      address,
      abi: GenericStrategyAbi,
      client: publicClient,
    }),
  );
};
