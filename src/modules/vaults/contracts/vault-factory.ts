import { getContract, GetContractReturnType } from 'viem';
import invariant from 'tiny-invariant';
import { VaultFactoryAbi, VaultFactoryAbiType } from '@/abi/vault-factory';
import { getContractAddress } from '@/config';
import { RegisteredPublicClient } from '@/modules/web3';
import { EncodableContract, getEncodable } from '@/utils/encodable';

// TODO: move to lido-sdk
export const getVaultFactoryContract = (
  publicClient: RegisteredPublicClient,
): EncodableContract<
  GetContractReturnType<VaultFactoryAbiType, RegisteredPublicClient>
> => {
  const address = getContractAddress(publicClient.chain.id, 'vaultFactory');

  invariant(
    address,
    '[getVaultFactoryContract] vaultFactoryAddress is not defined',
  );
  return getEncodable(
    getContract({
      address,
      abi: VaultFactoryAbi,
      client: publicClient,
    }),
  );
};
