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

type GetLidoEarnStrategyContractReturnType = EncodableContract<
  GetContractReturnType<EthEarnStrategyAbiType, RegisteredPublicClient>
>;

export const getLidoEarnStrategyContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): GetLidoEarnStrategyContractReturnType => {
  return getEncodable(
    getContract({
      address,
      abi: EthEarnStrategyAbi,
      client: publicClient,
    }),
  );
};

type GetLidoEarnVaultContractReturnType = EncodableContract<
  GetContractReturnType<EthVaultAbiType, RegisteredPublicClient>
>;

export const getLidoEarnVaultContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): GetLidoEarnVaultContractReturnType => {
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

type GetLidoEarnAsyncDepositQueueContractReturnType = EncodableContract<
  GetContractReturnType<EthDepositQueueAbiType, RegisteredPublicClient>
>;

export const getLidoEarnAsyncDepositQueueContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): GetLidoEarnAsyncDepositQueueContractReturnType => {
  return getEncodable(
    getContract({
      address,
      abi: EthDepositQueueAbi,
      client: publicClient,
    }),
  );
};

type GetLidoEarnRedeemQueueContractReturnType = EncodableContract<
  GetContractReturnType<EthRedeemQueueAbiType, RegisteredPublicClient>
>;

export const getLidoEarnRedeemQueueContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): GetLidoEarnRedeemQueueContractReturnType => {
  return getEncodable(
    getContract({
      address,
      abi: EthRedeemQueueAbi,
      client: publicClient,
    }),
  );
};

type GetLidoEarnShareManagerContractReturnType = EncodableContract<
  GetContractReturnType<EthShareManagerAbiType, RegisteredPublicClient>
>;

export const getLidoEarnShareManagerContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): GetLidoEarnShareManagerContractReturnType => {
  return getEncodable(
    getContract({
      address,
      abi: EthShareManagerAbi,
      client: publicClient,
    }),
  );
};
