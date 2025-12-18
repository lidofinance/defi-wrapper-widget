import { type Address, getContract } from 'viem';

import invariant from 'tiny-invariant';

import { WithdrawalQueueAbi } from '@/abi/withdrawal-queue-abi';
import type { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

export const getWQContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
) => {
  invariant(address, '[getWQContract] address is not defined');
  return getEncodable(
    getContract({
      address,
      abi: WithdrawalQueueAbi,
      client: {
        public: publicClient,
      },
    }),
  );
};
