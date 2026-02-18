import { type Address, getContract, GetContractReturnType } from 'viem';

import {
  GenericStrategyAbi,
  GenericStrategyAbiType,
} from '@/abi/generic-strategy-abi';
import type { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

export const getStrategyContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): GetContractReturnType<GenericStrategyAbiType, RegisteredPublicClient> => {
  return getEncodable(
    getContract({
      address,
      abi: GenericStrategyAbi,
      client: publicClient,
    }),
  );
};
