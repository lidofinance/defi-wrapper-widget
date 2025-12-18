import { type Address, getContract } from 'viem';

import { StvPoolAbi } from '@/abi/stv-pool-abi';
import type { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

export const getStvPoolContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
) => {
  return getEncodable(
    getContract({
      address,
      abi: StvPoolAbi,
      client: {
        public: publicClient,
      },
    }),
  );
};
