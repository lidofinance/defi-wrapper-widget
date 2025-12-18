import { getContract } from 'viem';

import invariant from 'tiny-invariant';

import { VaultHubAbi } from '@/abi/vault-hub';
import { getContractAddress } from '@/config';
import type {
  RegisteredPublicClient,
  RegisteredWalletClient,
} from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

// TODO: move to lido-sdk
export const getVaultHubContract = (publicClient: RegisteredPublicClient) => {
  const address = getContractAddress(publicClient.chain.id, 'vaultHub');

  invariant(address, '[getVaultHubContract] vaultHub is not defined');
  return getEncodable(
    getContract({
      address,
      abi: VaultHubAbi,
      client: {
        public: publicClient,
      },
    }),
  );
};

export const getWritableVaultHubContract = (
  publicClient: RegisteredPublicClient,
  walletClient: RegisteredWalletClient,
) => {
  const address = getContractAddress(publicClient.chain.id, 'vaultHub');

  invariant(address, '[getVaultHubContract] vaultHub is not defined');
  return getContract({
    address,
    abi: VaultHubAbi,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};
