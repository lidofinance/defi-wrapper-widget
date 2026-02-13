import { type Address, getContract } from 'viem';

import type { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

import {
  EthEarnStrategyAbi,
  ETH_VAULT_ABI,
  ETH_DEPOSIT_QUEUE_WSTETH_ABI,
  ETH_REDEEM_QUEUE_WSTETH_ABI,
  ETH_SHARE_MANAGER_ABI,
} from './abi';

export const getLidoEarnStrategyContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
) => {
  return getEncodable(
    getContract({
      address,
      abi: EthEarnStrategyAbi,
      client: {
        public: publicClient,
      },
    }),
  );
};

export const getLidoEarnVaultContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
) => {
  return getEncodable(
    getContract({
      address,
      abi: ETH_VAULT_ABI,
      client: {
        public: publicClient,
      },
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
) => {
  return getEncodable(
    getContract({
      address,
      abi: ETH_DEPOSIT_QUEUE_WSTETH_ABI,
      client: {
        public: publicClient,
      },
    }),
  );
};

export const getLidoEarnRedeemQueueContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
) => {
  return getEncodable(
    getContract({
      address,
      abi: ETH_REDEEM_QUEUE_WSTETH_ABI,
      client: { public: publicClient },
    }),
  );
};

export const getLidoEarnShareManagerContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
) => {
  return getEncodable(
    getContract({
      address,
      abi: ETH_SHARE_MANAGER_ABI,
      client: { public: publicClient },
    }),
  );
};
