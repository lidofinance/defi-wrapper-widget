import { getContract, GetContractReturnType } from 'viem';
import invariant from 'tiny-invariant';

import { LazyOracleAbi, LazyOracleAbiType } from '@/abi/lazy-oracle';
import { getContractAddress } from '@/config';

import type { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

export const getLazyOracleContract = (
  publicClient: RegisteredPublicClient,
): GetContractReturnType<LazyOracleAbiType, RegisteredPublicClient> => {
  const address = getContractAddress(publicClient.chain.id, 'lazyOracle');

  invariant(address, '[getLazyOracleContract] lazyOracle is not defined');
  return getEncodable(
    getContract({
      address,
      abi: LazyOracleAbi,
      client: publicClient,
    }),
  );
};
