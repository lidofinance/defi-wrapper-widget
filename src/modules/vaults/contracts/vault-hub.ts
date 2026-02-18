import { getContract, GetContractReturnType } from 'viem';

import invariant from 'tiny-invariant';

import { VaultHubAbi, VaultHubAbiType } from '@/abi/vault-hub';
import { getContractAddress } from '@/config';
import type { RegisteredPublicClient } from '@/modules/web3';
import { type EncodableContract, getEncodable } from '@/utils/encodable';

// TODO: move to lido-sdk
export const getVaultHubContract = (
  publicClient: RegisteredPublicClient,
): EncodableContract<
  GetContractReturnType<VaultHubAbiType, RegisteredPublicClient>
> => {
  const address = getContractAddress(publicClient.chain.id, 'vaultHub');

  invariant(address, '[getVaultHubContract] vaultHub is not defined');
  return getEncodable(
    getContract({
      address,
      abi: VaultHubAbi,
      client: publicClient,
    }),
  );
};
