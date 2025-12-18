import { type Address, getContract } from 'viem';

import type { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

import { ggvQueueAbi, ggvTellerAbi, ggvVaultAbi, ggvStrategyAbi } from './abi';

export const getGGVStrategyContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
) => {
  return getEncodable(
    getContract({
      address,
      abi: ggvStrategyAbi,
      client: {
        public: publicClient,
      },
    }),
  );
};

export const getGGVTellerContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
) => {
  return getEncodable(
    getContract({
      address,
      abi: ggvTellerAbi,
      client: {
        public: publicClient,
      },
    }),
  );
};

export const getGGVVaultContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
) => {
  return getEncodable(
    getContract({
      address,
      abi: ggvVaultAbi,
      client: {
        public: publicClient,
      },
    }),
  );
};

export const getGGVBoringQueueContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
) => {
  return getEncodable(
    getContract({
      address,
      abi: ggvQueueAbi,
      client: {
        public: publicClient,
      },
    }),
  );
};
