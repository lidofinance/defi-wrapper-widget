import { type Address, getContract, type GetContractReturnType } from 'viem';

import type { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable, EncodableContract } from '@/utils/encodable';

import {
  EthEarnStrategyAbi,
  EthVaultAbi,
  EthDepositQueueAbi,
  EthRedeemQueueAbi,
  EthShareManagerAbi,
  type EthEarnStrategyAbiType,
  type EthVaultAbiType,
  type EthDepositQueueAbiType,
  type EthRedeemQueueAbiType,
  type EthShareManagerAbiType,
} from './abi';

export const getLidoEarnStrategyContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): EncodableContract<
  GetContractReturnType<EthEarnStrategyAbiType, RegisteredPublicClient>
> => {
  return getEncodable(
    getContract({
      address,
      abi: EthEarnStrategyAbi,
      client: publicClient,
    }),
  );
};

export const getLidoEarnVaultContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): EncodableContract<
  GetContractReturnType<EthVaultAbiType, RegisteredPublicClient>
> => {
  return getEncodable(
    getContract({
      address,
      abi: EthVaultAbi,
      client: publicClient,
    }),
  );
};

// export const getLidoEarnSyncDepositQueueContract = (
//   address: Address,
//   publicClient: RegisteredPublicClient,
// ) => {
//   return getEncodable(
//     getContract({
//       address,
//       abi: ETH_DEPOSIT_QUEUE_ASYNC_WSTETH_ABI,
//       client: {
//         public: publicClient,
//       },
//     }),
//   );
// };

export const getLidoEarnAsyncDepositQueueContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): EncodableContract<
  GetContractReturnType<EthDepositQueueAbiType, RegisteredPublicClient>
> => {
  return getEncodable(
    getContract({
      address,
      abi: EthDepositQueueAbi,
      client: publicClient,
    }),
  );
};

export const getLidoEarnRedeemQueueContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): EncodableContract<
  GetContractReturnType<EthRedeemQueueAbiType, RegisteredPublicClient>
> => {
  return getEncodable(
    getContract({
      address,
      abi: EthRedeemQueueAbi,
      client: publicClient,
    }),
  );
};

export const getLidoEarnShareManagerContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): EncodableContract<
  GetContractReturnType<EthShareManagerAbiType, RegisteredPublicClient>
> => {
  return getEncodable(
    getContract({
      address,
      abi: EthShareManagerAbi,
      client: publicClient,
    }),
  );
};
