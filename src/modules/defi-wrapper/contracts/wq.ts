import { type Address, getContract, GetContractReturnType } from 'viem';

import invariant from 'tiny-invariant';

import {
  WithdrawalQueueAbi,
  WithdrawalQueueAbiType,
} from '@/abi/withdrawal-queue-abi';
import type { RegisteredPublicClient } from '@/modules/web3';
import { EncodableContract, getEncodable } from '@/utils/encodable';

export type WQContract = EncodableContract<
  GetContractReturnType<WithdrawalQueueAbiType, RegisteredPublicClient>
>;

export const getWQContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): WQContract => {
  invariant(address, '[getWQContract] address is not defined');
  return getEncodable(
    getContract({
      address,
      abi: WithdrawalQueueAbi,
      client: publicClient,
    }),
  );
};
