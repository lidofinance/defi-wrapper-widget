import { getContract, GetContractReturnType } from 'viem';
import invariant from 'tiny-invariant';

import { LidoV3Abi, LidoV3AbiType } from '@/abi/lido-v3-abi';
import { getContractAddress } from '@/config';
import type { RegisteredPublicClient } from '@/modules/web3';
import { EncodableContract, getEncodable } from '@/utils/encodable';

export const getLidoV3Contract = (
  publicClient: RegisteredPublicClient,
): EncodableContract<
  GetContractReturnType<LidoV3AbiType, RegisteredPublicClient>
> => {
  const address = getContractAddress(publicClient.chain.id, 'lido');

  invariant(address, '[getLidoV3Contract] lido is not defined');

  return getEncodable(
    getContract({
      address,
      abi: LidoV3Abi,
      client: publicClient,
    }),
  );
};
