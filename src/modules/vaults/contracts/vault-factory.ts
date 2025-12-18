import { getContract } from 'viem';
import invariant from 'tiny-invariant';
import { VaultFactoryAbi } from '@/abi/vault-factory';
import { getContractAddress } from '@/config';
import { RegisteredPublicClient } from '@/modules/web3';

// TODO: move to lido-sdk
export const getVaultFactoryContract = (
  publicClient: RegisteredPublicClient,
) => {
  const address = getContractAddress(publicClient.chain.id, 'vaultFactory');

  invariant(
    address,
    '[getVaultFactoryContract] vaultFactoryAddress is not defined',
  );
  return getContract({
    address,
    abi: VaultFactoryAbi,
    client: {
      public: publicClient,
    },
  });
};
