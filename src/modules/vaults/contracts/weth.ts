import { getContract, GetContractReturnType } from 'viem';
import { AbstractLidoSDKErc20 } from '@lidofinance/lido-ethereum-sdk/erc20';

import invariant from 'tiny-invariant';

import { WethABI, WethABIType } from '@/abi/weth-abi';
import { getContractAddress } from '@/config';
import type { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

export class LidoSDKwETH extends AbstractLidoSDKErc20 {
  public contractAddress() {
    const contractAddress = getContractAddress(this.core.chainId, 'weth');
    invariant(contractAddress, '[LidoSDKwETH] Contract address is not defined');
    return Promise.resolve(contractAddress);
  }
}

export const getWethContract = (
  publicClient: RegisteredPublicClient,
): GetContractReturnType<WethABIType, RegisteredPublicClient> => {
  const address = getContractAddress(publicClient.chain.id, 'weth');
  invariant(
    address,
    `[getWethContract] WETH address is undefined for chain:${publicClient.chain.id}`,
  );
  return getEncodable(
    getContract({
      abi: WethABI,
      address,
      client: publicClient,
    }),
  );
};
