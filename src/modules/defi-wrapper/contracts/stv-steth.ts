import { type Address, getContract } from 'viem';

import { StvStethAbi } from '@/abi/stv-steth-abi';
import type { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

export const getStvStethContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
) => {
  return getEncodable(
    getContract({
      address,
      abi: StvStethAbi,
      client: {
        public: publicClient,
      },
    }),
  );
};
