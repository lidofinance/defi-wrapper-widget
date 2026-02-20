import { type Address, getContract, GetContractReturnType } from 'viem';

import type { RegisteredPublicClient } from '@/modules/web3';
import { EncodableContract, getEncodable } from '@/utils/encodable';

import {
  GgvQueueAbi,
  GgvTellerAbi,
  GgvStrategyAbi,
  GgvVaultAbi,
  type GgvStrategyAbiType,
  type GgvTellerAbiType,
  type GgvQueueAbiType,
  type GgvVaultAbiType,
} from './abi';

export const getGGVStrategyContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): EncodableContract<
  GetContractReturnType<GgvStrategyAbiType, RegisteredPublicClient>
> => {
  return getEncodable(
    getContract({
      address,
      abi: GgvStrategyAbi,
      client: publicClient,
    }),
  );
};

export const getGGVVaultContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): EncodableContract<
  GetContractReturnType<GgvVaultAbiType, RegisteredPublicClient>
> => {
  return getEncodable(
    getContract({
      address,
      abi: GgvVaultAbi,
      client: publicClient,
    }),
  );
};

export const getGGVTellerContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): EncodableContract<
  GetContractReturnType<GgvTellerAbiType, RegisteredPublicClient>
> => {
  return getEncodable(
    getContract({
      address,
      abi: GgvTellerAbi,
      client: publicClient,
    }),
  );
};

export const getGGVBoringQueueContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): EncodableContract<
  GetContractReturnType<GgvQueueAbiType, RegisteredPublicClient>
> => {
  return getEncodable(
    getContract({
      address,
      abi: GgvQueueAbi,
      client: publicClient,
    }),
  );
};
