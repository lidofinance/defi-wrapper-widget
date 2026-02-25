import { getContract, GetContractReturnType } from 'viem';
import { AbstractLidoSDKErc20 } from '@lidofinance/lido-ethereum-sdk/erc20';

import invariant from 'tiny-invariant';

import { WethABI, WethABIType } from '@/abi/weth-abi';
import { getContractAddress } from '@/config';
import type { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable, EncodableContract } from '@/utils/encodable';

export class LidoSDKwETH extends AbstractLidoSDKErc20 {
  public contractAddress() {
    const contractAddress = getContractAddress(this.core.chainId, 'weth');
    invariant(contractAddress, '[LidoSDKwETH] Contract address is not defined');
    return Promise.resolve(contractAddress);
  }

  public async wethContract(): Promise<
    EncodableContract<
      GetContractReturnType<WethABIType, RegisteredPublicClient>
    >
  > {
    const address = await this.contractAddress();
    return getEncodable(
      getContract({
        abi: WethABI,
        address,
        client: this.core.rpcProvider as RegisteredPublicClient,
      }),
    );
  }
}
