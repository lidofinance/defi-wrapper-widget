import { type Address, getContract } from 'viem';

import { genericStrategyAbi } from '@/abi/generic-strategy-abi';
import type { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

export const getStrategyContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
) => {
  return getEncodable(
    getContract({
      address,
      abi: genericStrategyAbi,
      client: {
        public: publicClient,
      },
    }),
  );
};
