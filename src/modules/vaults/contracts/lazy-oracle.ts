import { getContract } from 'viem';
import invariant from 'tiny-invariant';

import { LazyOracleAbi } from '@/abi/lazy-oracle';
import { getContractAddress } from '@/config';

import type {
  RegisteredPublicClient,
  RegisteredWalletClient,
} from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

export const getLazyOracleContract = <TClient extends RegisteredPublicClient>(
  publicClient: TClient,
) => {
  invariant(
    publicClient.chain?.id,
    '[getLazyOracleContract] chainId is not defined',
  );

  const address = getContractAddress(publicClient.chain.id, 'lazyOracle');

  invariant(address, '[getLazyOracleContract] lazyOracle is not defined');
  return getEncodable(
    getContract({
      address,
      abi: LazyOracleAbi,
      client: {
        public: publicClient,
      },
    }),
  );
};

export const getWritableLazyOracleContract = <
  TClient extends RegisteredPublicClient,
  TWallet extends RegisteredWalletClient,
>(
  publicClient: TClient,
  walletClient: TWallet,
) => {
  invariant(
    publicClient.chain?.id,
    '[getWritableLazyOracleContract] chainId is not defined',
  );

  const address = getContractAddress(publicClient.chain.id, 'lazyOracle');

  invariant(
    address,
    '[getWritableLazyOracleContract] lazyOracle is not defined',
  );
  return getContract({
    address,
    abi: LazyOracleAbi,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};
