import { type Address, getContract } from 'viem';

import { distributorAbi } from '@/abi/distributor-abi';
import type { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

export const getDistributorContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
) => {
  return getEncodable(
    getContract({
      address,
      abi: distributorAbi,
      client: {
        public: publicClient,
      },
    }),
  );
};
